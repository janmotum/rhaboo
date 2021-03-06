var R = require('./core');

var Array_rhaboo_originals = Array_rhaboo_originals || {
  pop : Array.prototype.pop,
  push : Array.prototype.push,
  shift : Array.prototype.shift,
  unshift : Array.prototype.unshift,
  splice : Array.prototype.splice,
  reverse : Array.prototype.reverse,
  sort : Array.prototype.sort,
  fill : Array.prototype.fill,
};

var Array_rhaboo_defensively = function(mutator) {
  return function () { 
    var slotnum=undefined, refs;
    var ss = [];
    if (this._rhaboo) {
      slotnum = this._rhaboo.slotnum;
      refs = this._rhaboo.refs;
      R.release(this, ss, true);
    }
    var retval = Array_rhaboo_originals[mutator].apply(this, arguments);
    if (slotnum) {
      R.addRef(this, ss, slotnum, refs);
      R.execute(ss);
    }
    return retval;
  }
}

Array.prototype.push = function () {
  var l1 = this.length;
  var retval = Array_rhaboo_originals.push.apply(this, arguments);
  var l2 = this.length;
  if ( this._rhaboo !== undefined && l2>l1 ) {
    var ss = [];
    for (var i=l1; i<l2; i++) {
      R.storeProp(this, ss, i);
    }
    R.updateSlot(this, ss); //for length
    R.execute(ss);
  }
}

Array.prototype.pop = function () {
  var ss = [];
  var l = this.length;
  if ( this._rhaboo !== undefined && l>0 ) {
    R.forgetProp(this, ss, l-1);
  } 
  var ret = Array_rhaboo_originals.pop.apply(this, arguments);
  if ( this._rhaboo !== undefined && l>0 ) {
    R.updateSlot(this, ss); //for length
    R.execute(ss);
  }
  return ret;
}

Array.prototype.write = function(prop, val) { 
  Object.prototype.write.call(this, prop, val);
  var ss = [];
  R.updateSlot(this, ss);
  R.execute(ss);
}

//TODO: reverse/sort(unless sparse?) don't need initial delete, shift/unshift similarly
//Array.prototype.push = Array_rhaboo_defensively("push");
//Array.prototype.pop = Array_rhaboo_defensively("pop");
Array.prototype.shift = Array_rhaboo_defensively("shift");
Array.prototype.unshift = Array_rhaboo_defensively("unshift");
Array.prototype.splice = Array_rhaboo_defensively("splice");
Array.prototype.reverse = Array_rhaboo_defensively("reverse");
Array.prototype.sort = Array_rhaboo_defensively("sort");
Array.prototype.fill = Array_rhaboo_defensively("fill");
//Array.prototype.write = Array.prototype._rhaboo_defensively("write");

module.exports = {
  persistent : R.persistent,
  nuke : R.nuke,
};

