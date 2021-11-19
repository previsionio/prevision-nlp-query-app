/**
 * This is not good practice bu
 * as the script (and app) is small, we put some nodes with a global scope
 * because it's easy to iterate and test.
 * 
 */
var cover = document.getElementById("cover");
// Get the first image available in container
var viewer;
if (cover) {
    viewer = cover.getElementsByTagName("img")[0]
}

var photoFileForm = document.getElementById("infos-from-image");
var photoButton = document.getElementById("photo-button");

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

function displayResult(imagePredictionBoxes, scaleW = 1, scaleH = 1) {

    clearNode(errorMessageNode)
    clearNode(labelsNode)

    cover.classList.remove("hidden");
    labelsNode.classList.remove("hidden");
    presentationNode.classList.add("hidden")

    const label = document.createElement("p")
    const probaValue = document.createElement("p")
    const adviceText = document.createElement("p")


    probaValue.classList.add("big-value")
    label.classList.add("big-label")
    adviceText.classList.add("mini-advice")

    /**
     * Procedure for drawing bounding box
     */


    // Remove all previous bounding box
    let bb = document.getElementsByClassName('bounding-box');

    while (bb[0]) {
        bb[0].parentNode.removeChild(bb[0]);
    }


    // Always display server side advice
    if ("advice" in imagePredictionBoxes) {
        let advices = imagePredictionBoxes.advice
        adviceText.innerHTML = advices
    }


    const probableObject = imagePredictionBoxes.predictions
    const nbObject = probableObject.length
    let objectList = []
    // Lets draw bounding box and label only if objects
    if (nbObject == 1) {



        // While having sorted the object, we displya label inner text and proba
        // of the last one only, aka the most frequent

        for (let object of probableObject) {
            const square = document.createElement("div")

            label.innerText = `Du Fromage`


            if ("label" in object) {
                label.innerText = `${object.label}`
                objectList.push(`( ${(100 * object.probability).toPrecision(4)} %  )`)
            }

            if ("probability" in object) {
                if (object.probability > 0.8 && object.probability <= 1) {
                    probaValue.innerText = "I'm quite sure that this is a "
                }

                if (object.probability > 0.6 && object.probability <= 0.8) {
                    probaValue.innerText = "Huum, it probably is a"
                }

                if (object.probability > 0.4 && object.probability <= 0.6) {
                    probaValue.innerText = "I am not quite sure but maybe it is a "
                }
            }


            // Draw a bounding box for each
            const [yTopRelative, xLeftRelative, yBottomRelative, xRightRelative] = object.detection_box

            const xLeftAbsolute = xLeftRelative * viewer.clientWidth
            const yTopAbsolute = yTopRelative * viewer.clientHeight
            const xRightAbsolute = xRightRelative * viewer.clientWidth
            const yBottomAbsolute = yBottomRelative * viewer.clientHeight

            square.classList.add('bounding-box')

            if ("label" in object) {
                square.classList.add(object.label)
            }

            if ("probability" in object) {
                if (object.probability > 0.8 && object.probability <= 1) {
                    square.classList.add("sure");
                }
                if (object.probability > 0.6 && object.probability <= 0.8) {
                    square.classList.add("quite-sure");
                }
                if (object.probability > 0.4 && object.probability <= 0.6) {
                    square.classList.add("not-quite-sure");
                }
                if (object.probability > 0 && object.probability <= 0.4) {
                    square.classList.add("not-sure");
                }
            }


            const { x, y } = viewer.getBoundingClientRect();
            square.style.height = `${yBottomAbsolute - yTopAbsolute}px`
            square.style.width = `${xRightAbsolute - xLeftAbsolute}px`
            square.style.position = "absolute"
            square.style.top = `${y + yTopAbsolute}px`
            square.style.left = `${x + xLeftAbsolute}px`

            viewer.parentNode.insertBefore(square, viewer.nextSibling)
        }

        labelsNode.append(probaValue)
        labelsNode.append(label)
        adviceText.innerText = `${adviceText.innerText}.\n${(objectList.slice(-1).join(","))}`


    }

    if (nbObject > 1) {

        const objectsLabels = new Set([...probableObject.map(c => c.label)])

        const Counter = {};
        for (let currentObject of objectsLabels) {

            Counter[currentObject] = probableObject.filter(object => object.label === currentObject).length
        }


        const sentences = Object.entries(Counter).map(([label, count]) => `${count} ${label}`)

        probaValue.innerText = `There are ${nbObject} objects on this image ( ${sentences.join(', ')} )`

        for (let object of probableObject) {
            const square = document.createElement("div")

            if ("label" in object) {
                objectList.push(`( ${(100 * object.probability).toPrecision(4)} %  )`)
            }


            // Draw a bounding box for each
            const [yTopRelative, xLeftRelative, yBottomRelative, xRightRelative] = object.detection_box

            const xLeftAbsolute = xLeftRelative * viewer.clientWidth
            const yTopAbsolute = yTopRelative * viewer.clientHeight
            const xRightAbsolute = xRightRelative * viewer.clientWidth
            const yBottomAbsolute = yBottomRelative * viewer.clientHeight

            square.classList.add('bounding-box')

            if ("label" in object) {
                square.classList.add(object.label)
            }

            if ("probability" in object) {
                if (object.probability > 0.8 && object.probability <= 1) {
                    square.classList.add("sure");
                }
                if (object.probability > 0.6 && object.probability <= 0.8) {
                    square.classList.add("quite-sure");
                }
                if (object.probability > 0.4 && object.probability <= 0.6) {
                    square.classList.add("not-quite-sure");
                }
                if (object.probability > 0 && object.probability <= 0.4) {
                    square.classList.add("not-sure");
                }
            }


            const { x, y } = viewer.getBoundingClientRect();
            square.style.height = `${yBottomAbsolute - yTopAbsolute}px`
            square.style.width = `${xRightAbsolute - xLeftAbsolute}px`
            square.style.position = "absolute"
            square.style.top = `${y + yTopAbsolute}px`
            square.style.left = `${x + xLeftAbsolute}px`

            viewer.parentNode.insertBefore(square, viewer.nextSibling)
        }


        labelsNode.append(probaValue)
        adviceText.innerText = `${adviceText.innerText}.\n${(objectList.slice(-1).join(","))}`


    }
    labelsNode.append(adviceText)
}


function displayError(msg) {
    errorMessageNode.classList.remove("hidden")
    errorMessageNode.innerHTML = msg

}



function displayImage(formIdSrc) {

    photoFileForm.addEventListener("change", async function (event) {
        event.preventDefault();

        errorMessageNode.classList.add("hidden")
        cover.classList.remove("hidden");
        labelsNode.classList.remove("hidden");

        presentationNode.classList.add("hidden")

        // We create an image and when it's loaded, 
        // we graph its dimension then call the API
        const img = new Image();
        // Image is in ram
        img.onload = async function () {
            try {
                const FD = new FormData(photoFileForm);

                const res = await fetch(photoFileForm.action, {
                    method: 'POST', // or 'PUT'
                    body: FD
                })

                if (res.ok) {
                    const pred = await res.json()
                    console.log(pred)
                    // Draw Square

                    displayResult(pred)

                } else {
                    throw new Error(PUBLIC_FRIENDLY_MESSAGE)
                }

            } catch (error) {
                console.error(error)
                displayError(PUBLIC_FRIENDLY_MESSAGE)
            }
        }

        viewer.src = URL.createObjectURL(event.target.files[0]);
        img.src = URL.createObjectURL(event.target.files[0]);

        // Because flex box direction may change
        let box_w, box_h
        if (cover.clientHeight !== 0) {
            box_h = cover.clientHeight
            box_w = photoButton.clientWidth
        }
        if (cover.clientWidth !== 0) {
            box_w = cover.clientWidth
            box_h = photoButton.clientHeight
        }

        // Use the phot h button size as ref
        // as the cover fit with the image



        viewer.onload = function () {

            const ratio = this.width / this.height;



            if (this.width > box_w) {

                this.width = box_w;
                this.height = this.width / ratio;
            }


            if (this.height > box_h) {

                this.height = box_h
                this.width = ratio * this.height
            }


            URL.revokeObjectURL(viewer.src) // free memory

        }
    });
}

// When everythong is ok
window.addEventListener("load", function () {

    displayImage()

});