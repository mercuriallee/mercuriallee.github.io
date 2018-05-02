var query = function() {
	let QueryEntry = function() {
		this.select = function(field) {
			this.field = field;
      return this;
		};
		this.from = function(table) {
			this.table = table;
      return this;
		};
		this.where = function(assertion) {
			this.assertion = assertion;
      return this;
		};
		this.groupBy = function(group) {
      this.groupKey = group;
      return this;
		};
		this.orderBy = function(order) {
      this.orderKey = order;
      return this;
		};
		this.having = function(having) {
      return this;
		};
		this.execute = function() {
      return this.table;
		};
	};
	return new QueryEntry();
}

var numbers = [1, 2, 3];
query().select().from(numbers).exec();
