visual = {
    scaleLinear: function () {

        var obj = new this.fn();
        return obj;
    },
    fn: function () {
        this.lowerBound = null;
        this.higherBound = null;
    }
}
visual.fn.prototype.domain = function (arr) {
    this.lowerBound = arr[0];
    this.higherBound = arr[1];
    return this;
}
visual.fn.prototype.range = function (arr) {
    var fraction = this.higherBound / arr[1];
    console.log(fraction);
    //var fraction = arr[1] / this.higherBound;
    var getCoordinates = function (domain) {
        return domain * fraction;
    }
    return getCoordinates;
}
