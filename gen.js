var gen = function* (n) {
  for (var i = 0; i < 3; i++) {
    n++

    yield n
  }
}

var genObj = gen(2)

console.log(genObj.next())
console.log(genObj.next())
console.log(genObj.next())
console.log(genObj.next())