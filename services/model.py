import logging

from werkzeug.wrappers import Response

logger = logging.getLogger('Cheezam')
logging.basicConfig(format='[ %(name)s API ] %(asctime)s %(message)s',level=logging.INFO)

import json

from requests.exceptions import ConnectionError
from requests_oauthlib import OAuth2Session
from oauthlib.oauth2 import BackendApplicationClient

import os
from dotenv import load_dotenv

load_dotenv()
client_id = os.getenv('client_id')
client_secret = os.getenv('client_secret')
model_url = os.getenv('model_url')

client = BackendApplicationClient(client_id=client_id)


def transformres(res):
    logging.info(">" * 66)
    logging.info("transformres")
    logging.info(res)
    if not "response" in res :
        logging.error("no response in res")
        return []

    if not "predictions" in res["response"] :
        logging.error("No predictions in response")
        return []

    predictions = res["response"]["predictions"]

    preds = {}
    preds["content"] = []
    preds["similarity"] = []

    for pred in predictions:
        names = pred.split("_")
        if len(names) > 2:
            fieldName = names[1]
            fieldIndex = int(names[2])
            if fieldName in preds:
                preds[fieldName].append(predictions[pred])

    normedPreds = [{
        "content": el,
        "similarity": preds["similarity"][idx]
    } for (idx, el) in enumerate(preds["content"])]

    logging.info("<" * 66)
    return normedPreds


def send(query, top_k=5):
    logging.info(">" * 66)
    logging.info("send")
    try:
        predict_url = f"{model_url}/predict"

        payload = json.dumps({
            "query": query,
            "top_k": top_k
        })
        headers = {'Content-Type': 'application/json'}

        logging.info(payload)
        oauth = OAuth2Session(client=client)
        oauth.fetch_token(
            token_url=
            'https://accounts.prevision.io/auth/realms/prevision.io/protocol/openid-connect/token',
            client_id=client_id,
            client_secret=client_secret)

        prediction = oauth.post(predict_url, headers=headers, data=payload)
        res = prediction
        print(res)
        data=res.json()
        logging.info(data)
        res = transformres(data)
        logging.info("<" * 66)
        return res
    except ConnectionError:
        logging.error("Cannot call model")
        return {}


def predict_query(query, top_k=5):
    logging.info(">" * 66)
    logging.info("Prediction over a file")
    p = send(query, top_k)
    logging.info("<" * 66)
    return {"predictions": p}

