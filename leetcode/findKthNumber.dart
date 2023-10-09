import 'dart:math';

class Solution {
  int findKthNumber(int n, int k) {
    int current = 1;
    while(k > 0) {
      final steps = stepsCount(from: current, to: n);
      if(k > steps) {
        k -= steps;
        current += 1;
      } else {
          k--;
          if(k > 0) {
            current *= 10;
          }
      }
    }
    return current;
  }

  int stepsCount({int from=1, required int to}) {
    int first = from, last = from, count = 0;
    while(first <= to) {
      count += min(last, to) - first + 1;
      first = first * 10;
      last = last * 10 + 9;
    }
    return count;
  }
}
