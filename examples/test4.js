
_rhaboo_trace = function(s) { console.log(s); }

QUnit.test( "Load test: overwrite integer 3000 times", function( assert ) {
  var store = new Rhaboo.Persistent("Load");
  //Setting this callback slows the library down by a factor of about 3 ...
  Rhaboo.onBusiness(function (busy) {
    document.getElementById("business").innerHTML = busy?"Busy":"Idle";
  });
  for (var i=0;i<=3000;i++) {
    store.write("val", i);
  }
  assert.ok(true, "loaded");

});




