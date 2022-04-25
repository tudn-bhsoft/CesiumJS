var myAjax = new XMLHttpRequest();
myAjax.open("GET", "https://s3.amazonaws.com/CMSTest/squaw_creek_container_info.xml", false);
myAjax.send();
var xmlDocument = myAjax.responseXML;
var test = myAjax.status;

//Get Object
function getAllPoints() {
    var allPoint = {};
    var point = xmlDocument.getElementsByTagName("POINT");
    for (var i = 0; i < point.length; i++) {
        allPoint['C' + i] = point[i].attributes[0].value;
    }
    return allPoint;
}

function getAllLines() {
    var allLine = {};
    var point = xmlDocument.getElementsByTagName("LINE");
    for (var i = 0; i < point.length; i++) {
        allLine['L' + i] = point[i].attributes[1].value;
    }
    return allLine;
}

function getAllFaces() {
    var allPolygon = {};
    var point = xmlDocument.getElementsByTagName("POLYGON");
    for (var i = 0; i < point.length; i++) {
        allPolygon['F' + i] = point[i].attributes[1].value;
    }
    return allPolygon;
}

function getArrFaces() {
    var allFace = [];
    var faces = xmlDocument.getElementsByTagName("POLYGON");
    for (var i = 0; i < faces.length; i++) {
        allFace.push('F' + i);
    }
    return allFace;
}
//-------------------------------------------------------------------------
//Get Corrdinates
//Return array lines of face
function arrayFaces() {
    const faces = getAllFaces();
    const arrLineOfFace = [];
    for (var i in faces) {
        arrLineOfFace.push(faces[i].split(', '));
    }
    return arrLineOfFace;
}

//Return array points of face
function arrayLines() {
    var temp = [];
    for (var i = 0; i < arrayFaces().length; i++) {
        var temp1 = [];
        for (var j = 0; j < arrayFaces()[i].length; j++) {
            var temp2 = getLinesOfFace(arrayFaces()[i][j]).split(', ');
            for (var k = 0; k < temp2.length; k++) {
                temp1.push(temp2[k]);
            }
        }
        temp.push(temp1);
    }
    return temp;
}

//Return array coordinates
function arrayCoordinates() {
    var temp = arrayLines();
    const points = getAllPoints();
    var arrCoordinates = [];
    var newArrCoordinates = [];
    for (var i = 0; i < temp.length; i++) {
        var temp1 = [];
        for (var j = 0; j < temp[i].length; j++) {
            for (var k in points) {
                if (temp[i][j] === k) {
                    temp1.push(points[k].split(', '));
                }
            }
        }
        arrCoordinates.push(temp1)

    }
    for (var i in arrCoordinates) {
        var temp3 = [];
        for (var j = 0; j < arrCoordinates[i].length; j++) {
            for (var x = 0; x < arrCoordinates[i][j].length; x++) {
                temp3.push(parseFloat(arrCoordinates[i][j][x]));
            }

        }
        newArrCoordinates.push(temp3);
    }
    return newArrCoordinates;
}

function getLinesOfFace(face) {
    const lines = getAllLines();
    for (var i in lines) {
        if (i === face) {
            return lines[i];
        }
    }
}

function getFaces() {
    const faces = getAllFaces();
    const arrLineOfFace = [];
    for (var i in faces) {
        arrLineOfFace.push(i);
    }

    return arrLineOfFace;
}
//------------------------------------------------------------------------
//Show an entity
function showPoint(i, arrDataPoint) {
    viewer.entities.add({
        name: i,
        position: Cesium.Cartesian3.fromDegrees(
            parseFloat(arrDataPoint[0]),
            parseFloat(arrDataPoint[1]),
            parseFloat(arrDataPoint[2])),
        point: { pixelSize: 4, color: Cesium.Color.RED }
    });
}

function showPolyline(i, newPoint1, newPoint2) {
    viewer.entities.add({
        name: i,
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                parseFloat(newPoint1[0]),
                parseFloat(newPoint1[1]),
                parseFloat(newPoint1[2]),
                parseFloat(newPoint2[0]),
                parseFloat(newPoint2[1]),
                parseFloat(newPoint2[2]),
            ]),
            width: 2,
            material: Cesium.Color.BLACK,
        },
    });
}

//------------------------------------------------------------------------
//Event Handler
function showPolygon(name, i) {
    const arrCoordinates = arrayCoordinates();
    viewer.entities.add({
        name: name + i,
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                arrCoordinates[i]
            ),
            material: Cesium.Color.GRAY.withAlpha(0.5),
            perPositionHeight: true,
        },
    });

}

//------------------------------------------------------------------------
//Draw entity
function drawPoints() {
    const points = getAllPoints();
    for (var i in points) {
        var arrDataPoint = points[i].split(', ');
        showPoint(i, arrDataPoint);
    }
}

function drawLines() {
    const points = getAllPoints();
    const lines = getAllLines();
    var newPoint1 = [];
    var newPoint2 = [];
    var point1 = "";
    var point2 = "";
    for (var i in lines) {
        var arrLine = lines[i].split(', ')
        for (var j in points) {
            if (arrLine[0] === j) {
                point1 = points[j];
                newPoint1 = point1.split(', ');
            }
            else if (arrLine[1] === j) {
                point2 = points[j];
                newPoint2 = point2.split(', ');
            }
        }
        showPolyline(i, newPoint1, newPoint2);
    }
}

function drawFaces() {
    setColor();
    var tempId;
    viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
        if (tempId !== undefined) {
            tempId.polygon.material = Cesium.Color.GRAY.withAlpha(0.5);
        }
        var pickedFeature = viewer.scene.pick(movement.position);
        tempId = pickedFeature.id;
        for (var i in getArrFaces()) {
            if (pickedFeature.id.name === getArrFaces()[i]) {
                pickedFeature.id.polygon.material = Cesium.Color.RED.withAlpha(0.5);
                return;
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function setColor() {
    for (var i = 0; i < arrayFaces().length; i++) {
        showPolygon('F', i);
    }
}
