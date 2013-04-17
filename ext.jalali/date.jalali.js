Ext.override(Date, {
    clearTime: Ext.Function.createSequence(Date.prototype.clearTime,Date.prototype.invalidateJalaliConversion),
    setYear: Ext.Function.createSequence(Date.prototype.setYear,Date.prototype.invalidateJalaliConversion),
    setMonth: Ext.Function.createSequence(Date.prototype.setMonth,Date.prototype.invalidateJalaliConversion),
    setDate: Ext.Function.createSequence(Date.prototype.setDate,Date.prototype.invalidateJalaliConversion),
    add: Ext.Function.createSequence(Date.prototype.add,Date.prototype.invalidateJalaliConversion)
});

Ext.apply(Ext.Date, {
    jalali:{
            number2farsi:function (string)
            {
                var en_num = [[0],[1],[2],[3],[4],[5],[6],[7],[8],[9]];
                var fa_num = [['۰'],['۱'],['۲'],['۳'],['۴'],['۵'],['۶'],['۷'],['۸'],['۹']];
                    for(var i=9;i>=0;i--){
                        while(string.indexOf(en_num[i])>=0){
                            string=string.replace(en_num[i],fa_num[i]);
                        }
                    }
                return string;
            },
            isValid: function (y, m, d) {
                return Date.isJalaliValid(y,m,d);
            },

            /**
             * Corrects Jalali date of month if the date is invalid for the specified month of year.
             * @param {Number} year Jalali full year.
             * @param {Number} month Jalali month (0-based).
             * @param {Number} date Jalali date.
             * @return {Number} Corrected Jalali date.
             */
            correctDayOfMonth: function (year, month, date) {
                return Date.correctJalaliDateOfMonth(year, month, date);
            },

            /**
             * Checks whether the specified year is a leap year in Jalali calendar.
             * @param {Number} year A 4-digit year to check.
             */
            isLeapYear: function (year) {
                return Date.isJalaliLeapYear(year);
            },

            /**
             * Creates a new date instance based on the provided Jalali year, month (0-based) and date.
             * @param {Number} year Jalali full year.
             * @param {Number} month Jalali month (0-based).
             * @param {Number} date Jalali date.
             */
            create: function (year, month, date) {
                return Date.createJalali(year, month, date);
            },

            /**
             * Parses a Jalali formatted date string (like "1389/06/09") and returns a Date object.
             * @param {String} jalaliString Formatted string to parse.
             * @param {Boolean} strict True to validate date strings after parsing which will return null when invalid
             * (default is false).
             * @return {Date} A Date object which is set to the Gregorian conversion of input.
             */
            parse: function (jalaliString, strict) {
                return Date.parseJalali(jalaliString, strict);
            },

            /**
             * Month names of Jalali calendar. Override this for localization.
             */
            monthNames: [
        'فروردین',
        'اردیبهشت',
        'خرداد',
        'تیر',
        'مرداد',
        'شهریور',
        'مهر',
        'آبان',
        'آذر',
        'دی',
        'بهمن',
        'اسفند'
    ],

    dayNames: [
        'یکشنبه',
        'دوشنبه',
        'سه‌شنبه',
        'چهارشنبه',
        'پنج‌شنبه',
        'آدینه',
        'شنبه'
    ]
    ,MILLI : "ms",

    /**
     * Date interval constant
     * @type String
     */
    SECOND : "s",

    /**
     * Date interval constant
     * @type String
     */
    MINUTE : "mi",

    /** Date interval constant
     * @type String
     */
    HOUR : "h",

    /**
     * Date interval constant
     * @type String
     */
    DAY : "d",

    /**
     * Date interval constant
     * @type String
     */
    MONTH : "mo",

    /**
     * Date interval constant
     * @type String
     */
    YEAR : "y"

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
    }
});

Ext.apply(Ext.Date.jalali, {
    parse: function (jalaliString, strict) {
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
    formatCodes: {
            d: "Ext.String.leftPad(this.getJalaliDate(), 2, '0')",
            D: "Ext.Date.jalali.dayNames[this.getDay()]", // get localised short day name
            j: "this.getJalaliDate()",
            l: "Ext.Date.jalali.dayNames[this.getDay()]",
            N: "(this.getDay()+2 ? this.getDay()+2 : 7)",
            S: "م",
            w: "this.getDay()+2",
            z: "Ext.Date.jalali.getDayOfYear(this)",
            W: "Ext.String.leftPad(Ext.Date.jalali.getWeekOfYear(this), 2, '0')",
            F: "Ext.Date.jalali.monthNames[this.getJalaliMonth()]",
            m: "Ext.String.leftPad(this.getJalaliMonth() + 1, 2, '0')",
            M: "Ext.Date.jalali.monthNames(this.getJalaliMonth())", // get localised short month name
            n: "(this.getJalaliMonth())",
            t: "Ext.Date.jalali.getDaysInMonth(this)",
            L: "(Ext.Date.jalali.isLeapYear(this) ? 1 : 0)",
            o: "(this.getJalaliFullYear() + (Ext.Date.jalali.getWeekOfYear(this) == 1 && this.getJalaliMonth() > 0 ? +1 : (Ext.Date.jalali.getWeekOfYear(this) >= 52 && this.getJalaliMonth() < 11 ? -1 : 0)))",
            Y: "Ext.String.leftPad(this.getJalaliFullYear(), 4, '0')",
            y: "('' + this.getJalaliFullYear()).substring(2, 4)",
            a: "(this.getHours() < 12 ? 'صبح' : 'عصر')",
            A: "(this.getHours() < 12 ? 'صبح' : 'عصر')",
            g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
            G: "this.getHours()",
            h: "Ext.String.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
            H: "Ext.String.leftPad(this.getHours(), 2, '0')",
            i: "Ext.String.leftPad(this.getMinutes(), 2, '0')",
            s: "Ext.String.leftPad(this.getSeconds(), 2, '0')",
            u: "Ext.String.leftPad(this.getMilliseconds(), 3, '0')",
            O: "Ext.Date.getGMTOffset(this)",
            P: "Ext.Date.getGMTOffset(this, true)",
            T: "Ext.Date.getTimezone(this)",
            Z: "(this.getTimezoneOffset() * -60)"
        },

        formatFunctions:{
            'Jalali': function () {
                return Ext.Date.jalali.number2farsi(this.jalali.getFullYear() + '/' +
                        String.leftPad(this.jalali.getMonth() + 1, 2, '0') + '/' +
                        String.leftPad(this.jalali.getDay(), 2, '0'));
            }
        },
        
        getFormatCode : function(character) {
                var f = Ext.Date.jalali.formatCodes[character];

                if (f) {
                  f = typeof f == 'function'? f() : f;
                  Ext.Date.jalali.formatCodes[character] = f; // reassign function result to prevent repeated execution
                }

                // note: unknown characters are treated as literals
                return f || ("'" + Ext.String.escape(character) + "'");
            },

            // private
            createFormat : function(format) {
                var code = [],
                    special = false,
                    ch = '',
                    i;

                for (i = 0; i < format.length; ++i) {
                    ch = format.charAt(i);
                    if (!special && ch == "\\") {
                        special = true;
                    } else if (special) {
                        special = false;
                        code.push("'" + Ext.String.escape(ch) + "'");
                    } else {
                        code.push(Ext.Date.jalali.getFormatCode(ch));
                    }
                }
                Ext.Date.jalali.formatFunctions[format] = Ext.functionFactory("return " + code.join('+'));
            }
            ,
        parseFunctions: {
            /**
             * Parses a Jalali formatted date string (like "1389/06/09") and returns a Date object.
             * @param {String} jalaliString Formatted string to parse.
             * @param {Boolean} strict True to validate date strings after parsing which will return null when invalid
             * (default is false).
             * @return {Date} A Date object which is set to the Gregorian conversion of input.
             */
            'Jalali': Ext.Date.jalali.parse,
            'B/Q/R': Ext.Date.jalali.parse,
            'B/q/r': Ext.Date.jalali.parse,
            'b/q/r': function (value, strict) {
                return Ext.Date.jalali.parse('13' + value, strict);
            },
            'b/Q/R': function (value, strict) {
                return Ext.Date.jalali.parse('13' + value, strict);
            },
            'B': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse(value + '/' + (now.getJalaliMonth() + 1) + '/' + now.getJalaliDate(), strict);
            },
            'b': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse('13' + value + '/' + (now.getJalaliMonth() + 1) + '/' + now.getJalaliDate(), strict);
            },
            'q': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse(now.getJalaliFullYear() + '/' + value + '/' + now.getJalaliDate(), strict);
            },
            'Q': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse(now.getJalaliFullYear() + '/' + value + '/' + now.getJalaliDate(), strict);
            },
            'r': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse(now.getJalaliFullYear() + '/' + (now.getJalaliMonth() + 1) + '/' + value, strict);
            },
            'R': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse(now.getJalaliFullYear() + '/' + (now.getJalaliMonth() + 1) + '/' + value, strict);
                
            },
            'b/q': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse('13' + value + '/' + now.getJalaliDate(), strict);
            },
            'B/q': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse(value + '/' + now.getJalaliDate(), strict);
            },
            'B/Q': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse(value + '/' + now.getJalaliDate(), strict);
            },
            'b/Q': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse('13' + value + '/' + now.getJalaliDate(), strict);
            },
            'q/r': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse(now.getJalaliFullYear() + '/' + value, strict);
            },
            'Q/r': function (value, strict) {
                var now = new Date();
                return Ext.Date.jalali.parse(now.getJalaliFullYear() + '/' + value, strict);
            },
            'Q/R': function (value, strict) {
                var now = date();
                return Ext.Date.jalali.parse(now.getJalaliFullYear() + '/' + value, strict);
            },
            'q/R': function (value, strict) {
                var now = date();
                return Ext.Date.jalali.parse(now.getJalaliFullYear() + '/' + value, strict);
            }
        },
        format: function(date, format) {
                var formatFunctions = Ext.Date.jalali.formatFunctions;

            if (!Ext.isDate(date)) {
                return '';
            }

            if (formatFunctions[format] == null) {
                Ext.Date.jalali.createFormat(format);
            }

            return Ext.Date.jalali.number2farsi(formatFunctions[format].call(date) + '');
        },
            /**
             * Returns Jalali full year.
             * @return {Number} Jalali year.
             */
            getFullYear: function (date) {
                return date.getJalaliFullYear();
            },

            /**
             * Returns Jalali month. Month is 0-based.
             * @return {Number} Jalali month of year (0-based).
             */
            getMonth: function (date) {
                return date.getJalaliMonth();
            },

            /**
             * Returns Jalali date of month.
             * @return {Number} Jalali date of month.
             */
            getDay: function (date) {
                return date.getJalaliDate();
            },

            /**
             * Checks if the current date falls within a Jalali leap year.
             * @return {Boolean} True if the current date falls within a Jalali leap year, false otherwise.
             */
            isLeapYear: function (date) {
                return date.isJalaliLeapYear();
            },

            /**
             * Provides a convenient method for performing basic Jalali date arithmetic. This method
             * does not modify the Date instance being called - it creates and returns
             * a new Date instance containing the resulting date value.
             * @param {String} interval A valid date interval enum value.
             * @param {Number} value The amount to add to the current date.
             * @return {Date} The new Date instance.
             */
            add: function (date,interval, value) {
                var d = Ext.Date.clone(date);
                if (!interval || value === 0) {
                    return d;
                }

                d.convertToJalali();

                switch (interval.toLowerCase()) {
                case Ext.Date.MILLI:
                    d.setMilliseconds(d.getMilliseconds() + value);
                    d.convertFromJalali();
                    break;
                case Ext.Date.SECOND:
                    d.setSeconds(d.getSeconds() + value);
                    d.convertFromJalali();
                    break;
                case Ext.Date.MINUTE:
                    d.setMinutes(d.getMinutes() + value);
                    d.convertFromJalali();
                    break;
                case Ext.Date.HOUR:
                    d.setHours(d.getHours() + value);
                    d.convertFromJalali();
                    break;
                case Ext.Date.DAY:
                    d.jalaliDate += value;
                    d.convertFromJalali();
                    break;
                case Ext.Date.MONTH:
                    d.jalaliMonth += value;
                    d.jalaliYear += Math.floor(d.jalaliMonth / 12);
                    d.jalaliMonth %= 12;
                    if (d.jalaliMonth < 0) {
                        d.jalaliMonth += 12;
                    }
                    d.jalaliDate = Date.correctJalaliDateOfMonth(d.jalaliYear, d.jalaliMonth, d.jalaliDate);
                    d.convertFromJalali();
                    break;
                case Ext.Date.YEAR:
                    d.jalaliYear += value;
                    d.jalaliDate = Date.correctJalaliDateOfMonth(d.jalaliYear, d.jalaliMonth, d.jalaliDate);
                    d.convertFromJalali();
                    break;
                }
                return d;
            },

            /**
             * Returns the number of days in the current Jalali month, adjusted for leap year.
             * @return {Number} The number of days in the current Jalali month.
             */
            getDaysInMonth: function (date) {
                return date.getJalaliDaysInMonth();
            },

            /**
             * Returns the date of the first day of the Jalali month.
             * @return {Date} The date of the first day of the Jalali month.
             */
            getFirstDateOfMonth: function (date) {
                return date.getJalaliFirstDateOfMonth();
            },
            getLastDateOfMonth : function(date) {
                return date.getJalaliLastDateOfMonth();
            },
            getDayOfYear: function (date) {
                var month=date.getJalaliMonth();
                var dayOfYear=0;
                var daysInMonth=[31,31,31,31,31,31,30,30,30,30,30,29];
                
                for(i=0;i<month;i++)
                    dayOfYear+=parseInt(daysInMonth[i]);
                dayOfYear+=date.getJalaliDate();
                return dayOfYear;
            },
            getWeekOfYear: function (date) {
                var year = date.getJalaliFullYear();
                var d=Ext.Date.jalali.parse(year+"/1/1");
                var dayOfYear=Ext.Date.jalali.getDayOfYear(date);
                var newYearDayOfFirstWeek=d.getDay()+2;
                return Math.round((dayOfYear+newYearDayOfFirstWeek)/7);
            },
            getFirstDayOfMonth : function(date) {
                var day = (date.getDay() - (date.getJalaliDate() + 1)) % 7;
                return (day < 0) ? (day + 7) : day;
            },
            getLastDayOfMonth : function(date) {
                var d=new Date(date.getFullYear(),date.getMonth()+1,date.getDate());
                var day = d.getDay()+1;
                return (day < 0) ? (day + 7) : day;
            },
            clearTime : function(date, clone) {
                if (clone) {
                    return Ext.Date.clearTime(Ext.Date.clone(date));
                }

                // get current date before clearing time
                var d = date.getDate(),
                    hr,
                    c;

                // clear time
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);

                if (date.getDate() != d) { // account for DST (i.e. day of month changed when setting hour = 0)
                    // note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
                    // refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule

                    // increment hour until cloned date == current date
                    for (hr = 1, c = Ext.Date.add(date, Ext.Date.HOUR, hr); c.getDate() != d; hr++, c = Ext.Date.add(date, Ext.Date.HOUR, hr));

                    date.setDate(d);
                    date.setHours(c.getHours());
                }

                return date;
            },
            getShortMonthName : function(month) {
                return Ext.Date.jalali.monthNames[month].substr(0, 4);
            }
});