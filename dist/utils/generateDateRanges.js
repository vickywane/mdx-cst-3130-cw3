"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateRangeGenerator = void 0;
const dateRangeGenerator = function* (start, end, step = 1) {
    let d = start;
    while (d < end) {
        yield new Date(d);
        d.setDate(d.getDate() + step);
    }
};
exports.dateRangeGenerator = dateRangeGenerator;
