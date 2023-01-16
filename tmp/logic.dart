import 'dart:math';
enum Choice {
  A, B, C, D; 
  String toString() {
    switch(this) {
      case Choice.A: return 'A';
      case Choice.B: return 'B';
      case Choice.C: return 'C';
      case Choice.D: return 'D';
    }
  }
}

bool logicTest({
  required Choice q1,
  required Choice q2,
  required Choice q3,
  required Choice q4,
  required Choice q5, 
  required Choice q6, 
  required Choice q7, 
  required Choice q8, 
  required Choice q9, 
  required Choice q10
}) {
  int a=0,b=0,c=0,d=0;
  for(Choice x in [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10]) {
    switch (x){ 
      case Choice.A: a++; break;
      case Choice.B: b++; break;
      case Choice.C: c++; break;
      case Choice.D: d++; break;
    }
  }
  int mi = min(min(a, b), min(c, d)), ma = max(max(a, b), max(c, d));
  return 
      (q2==Choice.A&&q5==Choice.C || q2==Choice.B&&q5==Choice.D || q2==Choice.C&&q5==Choice.A || q2==Choice.D&&q5==Choice.B) &&
      (q3==Choice.A&&q3!=q6&&q3!=q2&&q3!=q4 || q3==Choice.B&&q6!=q3&&q6!=q2&&q6!=q4 || q3==Choice.C&&q2!=q3&&q2!=q6&&q2!=q4 || q3==Choice.D&&q4!=q3&&q4!=q6&&q4!=q2) &&
      (q4==Choice.A&&q1==q5 || q4==Choice.B&&q2==q7 || q4==Choice.C&&q1==q9 || q4==Choice.D&&q6==q10) &&
      (q5==Choice.A&&q5==q8 || q5==Choice.B&&q5==q4 || q5==Choice.C&&q5==q9 || q5==Choice.D&&q5==q7) &&
      (q6==Choice.A&&q2==q8&&q4==q8 || q6==Choice.B&&q1==q8&&q6==q8 || q6==Choice.C&&q3==q8&&q10==q8 || q6==Choice.D&&q5==q8&&q9==q8) &&
      (q7==Choice.A&&mi==c || q7==Choice.B&&mi==b || q7==Choice.C&&mi==a || q7==Choice.D&&mi==d) &&
      (q8==Choice.A&&(q1.index-q7.index).abs()!=1 || q8==Choice.B&&(q1.index-q5.index).abs()!=1 || q8==Choice.C&&(q1.index-q2.index).abs()!=1 || q8==Choice.D&&(q1.index-q10.index).abs()!=1 ) &&
      (q9==Choice.A&&((q1==q6)!=(q6==q5)) || q9==Choice.B&&((q1==q6)!=(q10==q5)) || q9==Choice.C&&((q1==q6)!=(q2==q5)) || q9==Choice.D&&((q1==q6)!=(q9==q5)) ) &&
      (q10==Choice.A&&ma-mi==3 || q10==Choice.B&&ma-mi==2 || q10==Choice.C&&ma-mi==4 || q10==Choice.D&&ma-mi==1);
}

Iterable<List<Choice>> iterateAndSolve() sync* {
  for(var q1 in [Choice.A, Choice.B, Choice.C, Choice.D]) {
    for(var q2 in [Choice.A, Choice.B, Choice.C, Choice.D]) {
      for(var q3 in [Choice.A, Choice.B, Choice.C, Choice.D]) {
        for(var q4 in [Choice.A, Choice.B, Choice.C, Choice.D]) {
          for(var q5 in [Choice.A, Choice.B, Choice.C, Choice.D]) {
            for(var q6 in [Choice.A, Choice.B, Choice.C, Choice.D]) {
              for(var q7 in [Choice.A, Choice.B, Choice.C, Choice.D]) {
                for(var q8 in [Choice.A, Choice.B, Choice.C, Choice.D]) {
                  for(var q9 in [Choice.A, Choice.B, Choice.C, Choice.D]) {
                    for(var q10 in [Choice.A, Choice.B, Choice.C, Choice.D]) {
                      if(logicTest(q1:q1, q2:q2, q3:q3, q4:q4, q5:q5, q6:q6, q7:q7, q8:q8, q9:q9, q10:q10)) {
                        yield [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10];
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return;
}

void main() {
  var answer = iterateAndSolve().last;
  answer.asMap().forEach((i, e)=>print('${i+1}: ${i<9?' ':''}$e'));
}

