//8-20
// grupiranje svih metoda u jednu klasu
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  //sve ove metode su prije napravljene dolje nize

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replace(/,/g, ' ');
      //ako ima sorting u query stringu, lancano ga povezi na postojeci query

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replace(/,/g, ' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // ovo je za excluding... nepotrebno, vise za primjer kako se radi
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // page u query obj je string, monozenje sa 1 daje number
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit); // metode iz mongoose

    return this;
  }
}

module.exports = APIFeatures;
