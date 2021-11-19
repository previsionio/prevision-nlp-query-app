/**
 * This is not good practice bu
 * as the script (and app) is small, we put some nodes with a global scope
 * because it's easy to iterate and test.
 * 
 */

var queryForm = document.getElementById("query-form");

var errorMessageNode = document.getElementById("error-message");
var labelsNode = document.getElementById("label-detected");
var presentationNode = document.getElementById("presentation");

const PUBLIC_FRIENDLY_MESSAGE = "Something went wrong. model is currently unavailable due to a large number of request."


function clearNode(node) {
    node.innerHTML = ""
}

function clearNodeID(nodeId) {
    let target = document.getElementById(nodeId)
    clearNode(target);
}

function displayResult(query, documents) {

    
    clearNode(errorMessageNode)
    clearNode(labelsNode)

    
    labelsNode.classList.remove("hidden");
    presentationNode.classList.add("hidden")

    const documentsList = document.createElement("dl")
    const querySection = document.createElement("p")

    querySection.classList.add("query-reminder")
    querySection.innerText = query

    for (doc of documents) {
        console.log(doc)
        const definitionTerm = document.createElement("dt")
        const definition = document.createElement("dd")

        definitionTerm.classList.add("definition-term")
        definition.classList.add("definition")
        
        definitionTerm.innerText=parseFloat(doc.similarity).toPrecision(3)

        if (doc.similarity <= 1 & doc.similarity > 0.1 ) {
            definitionTerm.classList.add("sure")
        }

        if (doc.similarity <= 0.1 & doc.similarity > 0.05 ) {
            definitionTerm.classList.add("quite-sure")
        }

        if (doc.similarity <= 0.05 & doc.similarity > 0.01 ) {
            definitionTerm.classList.add("not-quite-sure")
        }

        if (doc.similarity <= 0.01 & doc.similarity > 0 ) {
            definitionTerm.classList.add("not-sure")
        }
        definition.innerText=doc.content

        documentsList.append(definitionTerm)
        documentsList.append(definition)

    }
 


    labelsNode.append(querySection)
    labelsNode.append(documentsList)
 
}


function displayError(msg) {
    errorMessageNode.classList.remove("hidden")
    errorMessageNode.innerHTML = msg

}



function displayImage(formIdSrc) {

    queryForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        errorMessageNode.classList.add("hidden")
        
        labelsNode.classList.remove("hidden");

        presentationNode.classList.add("hidden")


        try {
            const FD = new FormData(queryForm);

            const datas = {}
            FD.forEach((value, key) => datas[key] = value);
            
            const res = await fetch(queryForm.action, {
                method: 'POST', // or 'PUT'
                body: FD
            })

            if (res.ok) {
                const pred = await res.json()
                displayResult(datas["query"], pred.predictions)

            } else {
                throw new Error(PUBLIC_FRIENDLY_MESSAGE)
            }

        } catch (error) {
            console.error(error)
            displayError(PUBLIC_FRIENDLY_MESSAGE)
        }


    });
}

// When everythong is ok
window.addEventListener("load", function () {

    displayImage()

});