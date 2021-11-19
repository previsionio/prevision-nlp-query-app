import logging
from flask import Blueprint, request
from io import BytesIO

from services import model

from collections import Counter
from random import choice

# define the blueprint
blueprint_model = Blueprint(name="blueprint_model", import_name=__name__)


logger = logging.getLogger('model')
logging.basicConfig(
    format='[ %(name)s API ] %(asctime)s %(message)s', level=logging.WARNING)



@blueprint_model.route("/health", methods=["GET"])
def health():
    res = {"msg": "I'm OK"}
    return res



@blueprint_model.route("/prediction", methods=["POST"])
def make_prediction_on_file(**kwargs):
    logger.info(">>>>>>>>>>>>>>  POST a file")
    logger.debug(kwargs)

    # Get the files from form
    query="mal au pied"
    topk=6

    res = model.predict_query(query,topk)

    logger.info("<<<<<<<<<<<<<<<query  Prediction API Output")
    logger.info(res)
    return res
