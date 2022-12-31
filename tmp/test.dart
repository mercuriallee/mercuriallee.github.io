import 'dart:math';

void main() {

  Map<String, num> hex2rgb(hex) {
    return Map.fromIterables(['r','g','b'], [for (Match m in RegExp(r'.{2}').allMatches(hex, 1)) int.parse(m.group(0)!, radix: 16)]);
  }

  print(Function.apply(hex2rgb, args));
}

List<String> get args => ['#fffffa'];
