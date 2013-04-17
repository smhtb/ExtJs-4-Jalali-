/* Jalali.js  Gregorian to Jalali and inverse date converter
 * Copyright (C) 2001  Roozbeh Pournader <roozbeh@sharif.edu>
 * Copyright (C) 2001  Mohammad Toossi <mohammad@bamdad.org>
 * Copyright (C) 2003,2008  Behdad Esfahbod <js@behdad.org>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You can receive a copy of GNU Lesser General Public License at the
 * World Wide Web address <http://www.gnu.org/licenses/lgpl.html>.
 *
 * For licensing issues, contact The FarsiWeb Project Group,
 * Computing Center, Sharif University of Technology,
 * PO Box 11365-8515, Tehran, Iran, or contact us the
 * email address <FWPG@sharif.edu>.
 */

/* Changes:
 * 2010-Sep-19:
 *      Some minor changes to names of functions for better naming conventions.
 *      Also redundant functions removed to prevent namespace pollution.
 *
 * 2008-Jul-32:
 *	Use a remainder() function to fix conversion of ancient dates
 *	(before 1600 gregorian).  Reported by Shamim Rezaei.
 *
 * 2003-Mar-29:
 *      Ported to javascript by Behdad Esfahbod
 *
 * 2001-Sep-21:
 *	Fixed a bug with "30 Esfand" dates, reported by Mahmoud Ghandi
 *
 * 2001-Sep-20:
 *	First LGPL release, with both sides of conversions
 */

Date.jalaliConverter = {};

Date.jalaliConverter.gregorianDaysInMonth = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
Date.jalaliConverter.jalaliDaysInMonth = new Array(31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29);

Date.jalaliConverter.div = function (a, b) {
    return Math.floor(a / b);
};

Date.jalaliConverter.remainder = function (a, b) {
    return a - Math.floor(a / b) * b;
};

/**
 * Converts a Gregorian date to Jalali.
 * @param {Array} g An array containing Gregorian year, month and date.
 * @return {Array} An array containing Jalali year, month and date.
 */
Date.jalaliConverter.gregorianToJalali = function (g) {
    var gy, gm, gd;
    var jy, jm, jd;
    var g_day_no, j_day_no;
    var j_np;

    var i;

    gy = g[0] - 1600;
    gm = g[1] - 1;
    gd = g[2] - 1;

    var div = Date.jalaliConverter.div;
    var remainder = Date.jalaliConverter.remainder;
    var g_days_in_month = Date.jalaliConverter.gregorianDaysInMonth;
    var j_days_in_month = Date.jalaliConverter.jalaliDaysInMonth;

    g_day_no = 365 * gy + div((gy + 3), 4) - div((gy + 99), 100) + div((gy + 399), 400);
    for (i = 0; i < gm; ++i)
        g_day_no += g_days_in_month[i];
    if (gm > 1 && ((gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0)))
    /* leap and after Feb */
        ++g_day_no;
    g_day_no += gd;

    j_day_no = g_day_no - 79;

    j_np = div(j_day_no, 12053);
    j_day_no = remainder(j_day_no, 12053);

    jy = 979 + 33 * j_np + 4 * div(j_day_no, 1461);
    j_day_no = remainder(j_day_no, 1461);

    if (j_day_no >= 366) {
        jy += div((j_day_no - 1), 365);
        j_day_no = remainder((j_day_no - 1), 365);
    }

    for (i = 0; i < 11 && j_day_no >= j_days_in_month[i]; ++i) {
        j_day_no -= j_days_in_month[i];
    }
    jm = i + 1;
    jd = j_day_no + 1;

    return new Array(jy, jm, jd);
};

/**
 * Converts a Jalali date to Gregorian.
 * @param {Array} j An array containing Jalali year, month and date.
 * @return {Array} An array containing Gregorian year, month and date.
 */
Date.jalaliConverter.jalaliToGregorian = function (j) {
    var gy, gm, gd;
    var jy, jm, jd;
    var g_day_no, j_day_no;
    var leap;

    var i;

    jy = j[0] - 979;
    jm = j[1] - 1;
    jd = j[2] - 1;

    var div = Date.jalaliConverter.div;
    var remainder = Date.jalaliConverter.remainder;
    var g_days_in_month = Date.jalaliConverter.gregorianDaysInMonth;
    var j_days_in_month = Date.jalaliConverter.jalaliDaysInMonth;

    j_day_no = 365 * jy + div(jy, 33) * 8 + div((remainder(jy, 33) + 3), 4);
    for (i = 0; i < jm; ++i)
        j_day_no += j_days_in_month[i];

    j_day_no += jd;

    g_day_no = j_day_no + 79;

    gy = 1600 + 400 * div(g_day_no, 146097);
    /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
    g_day_no = remainder(g_day_no, 146097);

    leap = 1;
    if (g_day_no >= 36525) /* 36525 = 365*100 + 100/4 */
    {
        g_day_no--;
        gy += 100 * div(g_day_no, 36524);
        /* 36524 = 365*100 + 100/4 - 100/100 */
        g_day_no = remainder(g_day_no, 36524);

        if (g_day_no >= 365)
            g_day_no++;
        else
            leap = 0;
    }

    gy += 4 * div(g_day_no, 1461);
    /* 1461 = 365*4 + 4/4 */
    g_day_no = remainder(g_day_no, 1461);

    if (g_day_no >= 366) {
        leap = 0;

        g_day_no--;
        gy += div(g_day_no, 365);
        g_day_no = remainder(g_day_no, 365);
    }

    for (i = 0; g_day_no >= g_days_in_month[i] + (i == 1 && leap); i++)
        g_day_no -= g_days_in_month[i] + (i == 1 && leap);
    gm = i + 1;
    gd = g_day_no + 1;

    return new Array(gy, gm, gd);
};

Ext.apply(Date, {

    /**
     * Validates a Jalali date.
     * @param y Year value.
     * @param m Month value, 1-based.
     * @param d Date value.
     * @return {Boolean} True if valid, false otherwise.
     */
    isJalaliValid: function (y, m, d) {
        if (y > 1500 || y < 1 || m > 12 || m < 1 || d > 31 || d < 1) {
            return false;
        }
        var g = Date.jalaliConverter.jalaliToGregorian([y, m, d]);
        var j = Date.jalaliConverter.gregorianToJalali(g);
        return j[0] === y && j[1] === m && j[2] === d;
    },

    /**
     * Corrects Jalali date of month if the date is invalid for the specified month of year.
     * @param {Number} year Jalali full year.
     * @param {Number} month Jalali month (0-based).
     * @param {Number} date Jalali date.
     * @return {Number} Corrected Jalali date.
     */
    correctJalaliDateOfMonth: function (year, month, date) {
        if (month === 11 && date > 29) {
            if (Date.isJalaliLeapYear(year)) {
                return 30;
            } else {
                return 29;
            }
        } else if (month > 5 && date > 30) {
            return 30;
        } else {
            return date;
        }
    },

    /**
     * Checks whether the specified year is a leap year in Jalali calendar.
     * @param {Number} year A 4-digit year to check.
     */
    isJalaliLeapYear: function (year) {
        return Date.isJalaliValid(year, 12, 30);
    },

    /**
     * Creates a new date instance based on the provided Jalali year, month (0-based) and date.
     * @param {Number} year Jalali full year.
     * @param {Number} month Jalali month (0-based).
     * @param {Number} date Jalali date.
     */
    createJalali: function (year, month, date) {
        var g = Date.jalaliConverter.jalaliToGregorian([year, month + 1, date]);
        return new Date(g[0], g[1] - 1, g[2], 12);
    },


    /**
     * Parses a Jalali formatted date string (like "1389/06/09") and returns a Date object.
     * @param {String} jalaliString Formatted string to parse.
     * @param {Boolean} strict True to validate date strings after parsing which will return null when invalid
     * (default is false).
     * @return {Date} A Date object which is set to the Gregorian conversion of input.
     */
    parseJalali: function (jalaliString, strict) {
        var split = jalaliString.split('/');
        var jy = parseInt(split[0], 10),
            jm = parseInt(split[1], 10),
            jd = parseInt(split[2], 10);
        if (isNaN(jy) || isNaN(jm) || isNaN(jd) || jy > 1500 || jy < 1 || jm > 12 || jm < 1 || jd > 31 || jd < 1) {
            return null;
        }
        var g = Date.jalaliConverter.jalaliToGregorian([jy, jm, jd]);
        var d = new Date(g[0], g[1] - 1, g[2], 12);
        if (strict &&
                (!d || d.getJalaliFullYear() !== jy || d.getJalaliMonth() + 1 !== jm && d.getJalaliDate() !== jd)) {
            return null;
        }
        return d;
    },

    /**
     * Month names of Jalali calendar. Override this for localization.
     */
    jalaliMonthNames: [
        'Farvardin',
        'Ordibehesht',
        'Khordad',
        'Tir',
        'Amordad',
        'Shahrivar',
        'Mehr',
        'Aban',
        'Azar',
        'Dey',
        'Bahman',
        'Esfand'
    ]
});

/**
 * Jalali format codes. List of Jalali format codes:
 * <pre><code>
 Format  Description                                                          Example returned values
 ------  -------------------------------------------------------------------  -----------------------
   r     Jalali day of the month without leading zeros                        1 to 31
   R     Jalali day of the month, 2 digits with leading zeros                 01 to 31
   q     Numeric representation of Jalali month without leading zeros         1 to 12
   Q     Numeric representation of Jalali month, 2 digits with leading zeros  01 to 12
   e     Full textual representation of Jalali month                          Farvardin to Esfand
   b     Short representation of Jalali year, 2 digits                        89 or 60
   B     Full numeric representation of Jalali year, 4 digits                 1389 or 1360
 * </code></pre>
 * Example usage:
 * <pre><code>
 var d = new Date();
 console.log(d.format('B/Q/R'));     // 1389/06/14
 console.log(d.format('b/q/r'));     // 89/6/14
 console.log(d.format('l, r e B'));  // Sunday, 14 Shahrivar 1389
 * </code></pre>
 */
Ext.apply(Date.formatCodes, {
    r: "this.getJalaliDate()",
    R: "Ext.String.leftPad(this.getJalaliDate(), 2, '0')",
    q: "(this.getJalaliMonth() + 1)",
    Q: "Ext.String.leftPad(this.getJalaliMonth() + 1, 2, '0')",
    e: "Ext.Date.jalaliMonthNames[this.getJalaliMonth()]",
    b: "('' + this.getJalaliFullYear()).substring(2, 4)",
    B: "this.getJalaliFullYear()"
});

Ext.apply(Date.formatFunctions, {
    /**
     * Formats date instances using Jalali format (like: "1389/06/14").
     * @return {String} Textual representation of Jalali date.
     */
    'Jalali': function () {
        return this.getJalaliFullYear() + '/' +
                String.leftPad(this.getJalaliMonth() + 1, 2, '0') + '/' +
                String.leftPad(this.getJalaliDate(), 2, '0');
    }
});

Ext.apply(Date.parseFunctions, {
    /**
     * Parses a Jalali formatted date string (like "1389/06/09") and returns a Date object.
     * @param {String} jalaliString Formatted string to parse.
     * @param {Boolean} strict True to validate date strings after parsing which will return null when invalid
     * (default is false).
     * @return {Date} A Date object which is set to the Gregorian conversion of input.
     */
    'Jalali': Date.parseJalali,
    'B/Q/R': Date.parseJalali,
    'B/q/r': Date.parseJalali,
    'b/q/r': function (value, strict) {
        var now = new Date();
        return now.parseJalali('13' + value, strict);
    },
    'b/Q/R': function (value, strict) {
        var now = new Date();
        return now.parseJalali('13' + value, strict);
    },
    'B': function (value, strict) {
        var now = new Date();
        return now.parseJalali(value + '/' + (now.getJalaliMonth() + 1) + '/' + now.getJalaliDate(), strict);
    },
    'b': function (value, strict) {
        var now = new Date();
        return now.parseJalali('13' + value + '/' + (now.getJalaliMonth() + 1) + '/' + now.getJalaliDate(), strict);
    },
    'q': function (value, strict) {
        var now = new Date();
        return now.parseJalali(now.getJalaliFullYear() + '/' + value + '/' + now.getJalaliDate(), strict);
    },
    'Q': function (value, strict) {
        var now = new Date();
        return now.parseJalali(now.getJalaliFullYear() + '/' + value + '/' + now.getJalaliDate(), strict);
    },
    'r': function (value, strict) {
        var now = new Date();
        return now.parseJalali(now.getJalaliFullYear() + '/' + (now.getJalaliMonth() + 1) + '/' + value, strict);
    },
    'R': function (value, strict) {
        var now = new Date();
        return now.parseJalali(now.getJalaliFullYear() + '/' + (now.getJalaliMonth() + 1) + '/' + value, strict);
    },
    'b/q': function (value, strict) {
        var now = new Date();
        return now.parseJalali('13' + value + '/' + now.getJalaliDate(), strict);
    },
    'B/q': function (value, strict) {
        var now = new Date();
        return now.parseJalali(value + '/' + now.getJalaliDate(), strict);
    },
    'B/Q': function (value, strict) {
        var now = new Date();
        return now.parseJalali(value + '/' + now.getJalaliDate(), strict);
    },
    'b/Q': function (value, strict) {
        var now = new Date();
        return now.parseJalali('13' + value + '/' + now.getJalaliDate(), strict);
    },
    'q/r': function (value, strict) {
        var now = new Date();
        return now.parseJalali(now.getJalaliFullYear() + '/' + value, strict);
    },
    'Q/r': function (value, strict) {
        var now = new Date();
        return now.parseJalali(now.getJalaliFullYear() + '/' + value, strict);
    },
    'Q/R': function (value, strict) {
        var now = new Date();
        return now.parseJalali(now.getJalaliFullYear() + '/' + value, strict);
    },
    'q/R': function (value, strict) {
        var now = new Date();
        return now.parseJalali(now.getJalaliFullYear() + '/' + value, strict);
    }
});

Ext.override(Date, {

    /**
     * Calculates current Jalali date and caches the result. Methods that change this instance's state,
     * should invalidate cache.
     */
    convertToJalali: function () {
        if (!this.jalaliConverted) {
            var j = Date.jalaliConverter.gregorianToJalali([this.getFullYear(), this.getMonth() + 1, this.getDate()]);
            this.jalaliYear = j[0];
            this.jalaliMonth = j[1] -1;
            this.jalaliDate = j[2];
            this.jalaliConverted = true;
        }
    },

    /**
     * Calculates current Gregorian date.
     */
    convertFromJalali: function () {
        var g = Date.jalaliConverter.jalaliToGregorian([this.jalaliYear, this.jalaliMonth + 1, this.jalaliDate]);
        this.setFullYear(g[0]);
        this.setMonth(g[1] - 1);
        this.setDate(g[2]);
        this.jalaliConverted = false;
        this.convertToJalali();
    },

    /**
     * Invalidates cache of Jalali conversion, so convertToJalali() will recalculate Jalali values the next time.
     */
    invalidateJalaliConversion: function () {
        this.jalaliConverted = false;
    },

    /**
     * Returns Jalali full year.
     * @return {Number} Jalali year.
     */
    getJalaliFullYear: function () {
        this.convertToJalali();
        return this.jalaliYear;
    },

    /**
     * Returns Jalali month. Month is 0-based.
     * @return {Number} Jalali month of year (0-based).
     */
    getJalaliMonth: function () {
        this.convertToJalali();
        return this.jalaliMonth;
    },

    /**
     * Returns Jalali date of month.
     * @return {Number} Jalali date of month.
     */
    getJalaliDate: function () {
        this.convertToJalali();
        return this.jalaliDate;
    },

    /**
     * Checks if the current date falls within a Jalali leap year.
     * @return {Boolean} True if the current date falls within a Jalali leap year, false otherwise.
     */
    isJalaliLeapYear: function () {
        this.convertToJalali();
        return Date.isJalaliLeapYear(this.jalaliYear);
    },

    /**
     * Provides a convenient method for performing basic Jalali date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to add to the current date.
     * @return {Date} The new Date instance.
     */
    

    /**
     * Returns the number of days in the current Jalali month, adjusted for leap year.
     * @return {Number} The number of days in the current Jalali month.
     */
    getJalaliDaysInMonth: function () {
        this.convertToJalali();
        if (this.jalaliMonth < 6) {
            return 31;
        } else if (this.jalaliMonth < 11) {
            return 30;
        } else if (this.isJalaliLeapYear()) {
            return 30;
        } else {
            return 29;
        }
    },

    /**
     * Returns the date of the first day of the Jalali month.
     * @return {Date} The date of the first day of the Jalali month.
     */
    getJalaliFirstDateOfMonth: function () {
        this.convertToJalali();
        return Date.createJalali(this.jalaliYear, this.jalaliMonth, 1);
    },
    getJalaliLastDateOfMonth : function(date) {
        this.convertToJalali();
        return Date.createJalali(this.jalaliYear, this.jalaliMonth, this.getJalaliDaysInMonth());
    },
    setJalaliDate: function(newDate){
        this.convertToJalali();
        var year=this.jalaliYear;
        var month=this.jalaliMonth;
        var g = Date.jalaliConverter.jalaliToGregorian([year,month+1 , newDate]);
        return new Date(g[0], g[1] - 1, g[2], 12);
    }
});