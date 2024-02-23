const categories = {
  inflow: {},
  outflow: {},
  init() {},
  add(flow, name) {
    if (!name) return false;
    if (
      Object.values(this[flow])
        .map((category) => category.name)
        .includes(name)
    )
      return false;
    const id = Object.keys(this[flow]).length;
    this[flow][id] = {
      id,
      name,
    };
    return id;
  },
};

const entries = {
  entries: {},
  index: null,
  init() {
    const categories = Alpine.store("categories");

    const incomeId = categories.add("inflow", "Kindergeld");
    const rentId = categories.add("outflow", "Rent");
    const savingsId = categories.add("outflow", "Savings");

    const id1 = this.add();
    this.setIndex(id1);
    this.setValue("inflow", incomeId, 1000);
    this.setValue("outflow", rentId, 600);
    this.setValue("outflow", savingsId, 500);

    const id2 = this.add();
    this.setIndex(id2);
    this.setValue("inflow", incomeId, 1000);
    this.setValue("outflow", rentId, 600);
    this.setValue("outflow", savingsId, 300);

    const id3 = this.add();
    this.setIndex(id3);
    this.setValue("inflow", incomeId, 1000);
    this.setValue("outflow", rentId, 600);
    this.setValue("outflow", savingsId, 400);

    const id4 = this.add();

    this.setIndex(id1);
  },
  setDate(id, date) {
    if (
      Object.values(this.entries)
        .filter((e) => e.id !== id)
        .map((e) => e.date)
        .filter((d) => d.year === date.year && d.month === date.month)
        .length !== 0
    )
      return false;
    if (date.month < 1 || date.month > 12) return false;
    this.entries[id].date = date;
    return true;
  },
  setIndex(id) {
    this.index = this.entries[id];
  },
  del(id) {
    if (
      this.entries[id].sum("inflow") !== 0 ||
      this.entries[id].sum("outflow") !== 0
    )
      return false;
    if (this.index.id === id)
      this.index = Object.values(this.entries).filter((e) => e.id !== id)[0];
    delete this.entries[id];
    return true;
  },
  foo(data) {
    console.log(data);
  },
  load(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      const json = JSON.parse(content);
      Alpine.store("entries").foo(json);
    };
    reader.readAsText(file);
    console.log(json);
  },
  sortedEntries() {
    return Object.values(this.entries).sort((a, b) => {
      if (!a.date || !b.date) return 1;
      if (a.date.year != b.date.year) return b.date.year - a.date.year;
      if (a.date.month != b.date.month) return b.date.month - a.date.month;
      return 0;
    });
  },
  add() {
    const id = Object.keys(this.entries).length;
    this.entries[id] = new Entry(id);
    this.setIndex(id);
    let date = getNow();
    while (!this.setDate(id, date)) {
      date.month += 1;
      if (date.month === 13) {
        date.year += 1;
        date.month = 1;
      }
    }
    return id;
  },
  setValue(flow, categoryId, value) {
    if (isNaN(value)) return false;
    value = Number(value);
    this.index[flow][categoryId] = {
      id: categoryId,
      value,
    };
    this.index.sums[flow] = this.index.sum(flow);
    this.index.balance = this.index.sums.inflow - this.index.sums.outflow;
  },
};

function getDate(year, month) {
  return { year, month };
}

function getNow() {
  const now = new Date();
  return getDate(now.getFullYear(), now.getMonth() + 1);
}

function getOptions() {
  const now = getNow();
  const next = getDate(now.year, now.month + 1);
  const thisYear = [...Array(next.month).keys()].map((m) =>
    getDate(now.year, next.month - m),
  );
  const pastYears = [...Array(10 * 12).keys()].map((x) => {
    const y = Math.floor(x / 12) + 1;
    const m = x % 12;
    return getDate(now.year - y, 12 - m);
  });
  return [...thisYear, ...pastYears];
}

function isSameMonth(date1, date2) {
  return date1.year === date2.year && date1.month === date2.month;
}

function isCurrentMonth(date) {
  return isSameMonth(date, getNow());
}

function stringDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function getMonths() {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
}

function stringToMonth(string) {
  if (!isNaN(string)) {
    const month = Math.floor(Number(string)) % 12;
    if (month === 0) return 12;
    if (month < 0) return -month;
    return month;
  }
  const distances = getMonths()
    .map((m) => m.slice(0, string.length + 1))
    .map((m) => stringDistance(m, string));
  return distances.indexOf(Math.min(...distances)) + 1;
}

function monthToString(month) {
  return getMonths()[month - 1];
}

function dateToString(date) {
  return `${monthToString(date.month)} ${date.year}`;
}

function amountToString(amount, options = { cents: false, signed: false }) {
  const { cents, signed } = options;
  if (!amount) amount = 0;
  let sign = "";
  if (signed && amount > 0) sign = "+ ";
  if (signed && amount < 0) (sign = "- "), (amount = -amount);
  if (signed && amount === 0) sign = "± ";
  const digits = cents ? 2 : 0;
  const currency = Alpine.store("currency");
  return `${sign}${Number(amount).toFixed(digits)} ${currency}`;
}

function Entry(id) {
  this.id = id;
  this.date = undefined;
  this.inflow = {};
  this.outflow = {};
  this.sum = function (flow) {
    return Object.values(this[flow])
      .map((category) => category.value)
      .reduce((v1, v2) => v1 + v2, 0);
  };
  this.sums = {
    inflow: 0,
    outflow: 0,
  };
  this.balance = 0;
}

function addCategoryWithValue(flow, name, value) {
  if (isNaN(value)) return false;
  const categories = Alpine.store("categories");
  const categoryId = categories.add(flow, name);
  const entries = Alpine.store("entries");
  entries.setValue(flow, categoryId, value);
}
