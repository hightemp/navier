/**
 * Copyright (c) 2009 Oliver Hunt <http://nerget.com>
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

if (this.CanvasRenderingContext2D && !CanvasRenderingContext2D.createImageData) {
    CanvasRenderingContext2D.prototype.createImageData = function (w,h) {
        return this.getImageData(0,0,w,h);
    }
}
(function () {
    var buffer;
    var bufferData;
    var canvas;
    var clampData = false;
    function prepareBuffer(field) {
        canvas = canvas || document.getElementById("canvas");
        if (buffer && buffer.width == field.width() && buffer.height == field.height())
            return;
        buffer = document.createElement("canvas");
        buffer.width = field.width();
        buffer.height = field.height();
        var context = buffer.getContext("2d");
        try {
            bufferData = context.createImageData(field.width(), field.height());
        } catch(e) {
            return null;
        }
        if (!bufferData)
            return null;
        var max = field.width() * field.height() * 4;
        for (var i=3; i<max; i+=4)
            bufferData.data[i] = 255;
        bufferData.data[0] = 256;
        if (bufferData.data[0] > 255)
            clampData = true;
        bufferData.data[0] = 0;
    }

    function displayDensity(field) {
        prepareBuffer(field);
        var context = canvas.getContext("2d");
        var width = field.width();
        var height = field.height();

        if (bufferData) {
            var data = bufferData.data;
            var dlength = data.length;
            var j = -3;
            if (clampData) {
                for (var x = 0; x < width; x++) {
                    for (var y = 0; y < height; y++) {
                        var d = field.getDensity(x, y) * 255 / 5;
                        d = d | 0;
                        if (d > 255)
                            d = 255;
                        data[4*(y * height + x) + 1] = d;
                    }
                }
            } else {
                for (var x = 0; x < width; x++) {
                    for (var y = 0; y < height; y++)
                        data[4*(y * height + x) + 1] =  field.getDensity(x, y) * 255 / 5;
                }
            }
            context.putImageData(bufferData, 0, 0);
        } else {
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    var d = field.getDensity(x, y) / 5;
                    context.setFillColor(0, d, 0, 1);
                    context.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    function displayVelocity(field) {
        var context = canvas.getContext("2d");
        context.save();
        context.lineWidth=1;
        var wScale = canvas.width / field.width();
        var hScale = canvas.height / field.height();
        context.fillStyle="black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "rgb(0,255,0)";
        var vectorScale = 10;
        context.beginPath();
        for (var x = 0; x < field.width(); x++) {
            for (var y = 0; y < field.height(); y++) {
                context.moveTo(x * wScale + 0.5 * wScale, y * hScale + 0.5 * hScale);
                context.lineTo((x + 0.5 + vectorScale * field.getXVelocity(x, y)) * wScale, 
                               (y + 0.5 + vectorScale * field.getYVelocity(x, y)) * hScale);
            }
        }
        context.stroke();
        context.restore();
    }
    var showVectors = false;
    toggleDisplayFunction = function(canvas) {
        if (showVectors) {
            showVectors = false;
            canvas.width = displaySize;
            canvas.height = displaySize;
            return displayVelocity;
        }
        showVectors = true;
        canvas.width = fieldRes;
        canvas.height = fieldRes;
        return displayDensity;
    }
})();
