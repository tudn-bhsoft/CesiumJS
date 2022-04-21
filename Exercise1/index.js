var myAjax = new XMLHttpRequest();
myAjax.open("GET", "squaw_creek_container_info.xml", false);
myAjax.setRequestHeader("Content-Type", "squaw_creek_container_info.xml");
myAjax.send(null);
var xmlDocument = myAjax.responseXML;
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

//-------------------------------------------------------------------------
//Trả về mảng các face (gồm mảng các line)
function arrayFaces() {
    const faces = getAllFaces();
    const arrLineOfFace = [];
    for (var i in faces) {
        arrLineOfFace.push(faces[i].split(', '));
    }
    return arrLineOfFace;
}

//Trả về mảng các face(gồm mảng các point)
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
//Trả về mảng các face (gồm mảng các coordinate)
function arrayCoordinates() {
    var temp = arrayLines();
    const points = getAllPoints();
    var arrCoordinates = [];
    var newArrCoordinates = [];
    for (var i = 0; i < temp.length; i++) {
        var temp1 = [];
        for (var j = 0; j < temp[i].length; j++) {
            for (k in points) {
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

function getLinesOfFace(face) {
    const lines = getAllLines();
    for (var i in lines) {
        if (i === face) {
            return lines[i];
        }
    }
}

//------------------------------------------------------------------------
//Draw on CesiumJS
function drawPoints() {
    const points = getAllPoints();
    for (var i in points) {
        dataPoint = points[i];
        var arrDataPoint = points[i].split(', ')
        viewer.entities.add({
            name: i,
            position: Cesium.Cartesian3.fromDegrees(arrDataPoint[0], arrDataPoint[1], arrDataPoint[2]),
            point: { pixelSize: 5, color: Cesium.Color.RED }
        });
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
        viewer.entities.add({
            name: i,
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                    newPoint1[0], newPoint1[1], newPoint1[2],
                    newPoint2[0], newPoint2[1], newPoint2[2],
                ]),
                width: 2,
                material: Cesium.Color.RED,
            },
        });
    }
}

function drawFaces() {
    const arrCoordinates = arrayCoordinates();
    console.log(arrCoordinates);
    for (var i = 0; i < arrayFaces().length; i++) {
        viewer.entities.add({
            name: 'F' + i,
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                    arrCoordinates[i]
                ),
                material: Cesium.Color.GREEN,
                perPositionHeight: true,
            },
        });
    }
}