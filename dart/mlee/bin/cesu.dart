import 'dart:io';
import 'dart:convert';

const leftPadLength  = 4;
const labelLength    = 15;
const outBytesOffset = 40;
const timeInteval    = 1000; //ms

class IOBytes {
  final num inBytes;
  final num outBytes;

  const IOBytes(this.inBytes, this.outBytes);
}

void main() {
  Stream<Map<String, IOBytes>> Function() fetchInstantBytes;
  if(Platform.isMacOS) {
    fetchInstantBytes = fetchInstantBytesDarwin;
  } else if(Platform.isLinux) {
    fetchInstantBytes = fetchInstantBytesLinux;
  } else {
    throw 'Not support ${Platform.operatingSystem} system.';
  }

  dumpDeltaBytes(fetchInstantBytes()).forEach(print);
}

Stream<Map<String, IOBytes>> fetchInstantBytesDarwin() async* {
  while(true) {
    ProcessResult processResult = await Process.run('netstat', ['-ib'], stdoutEncoding: Utf8Codec());
    String result = processResult.stdout;
    yield { 
      for (
        var row in result.split('\n').sublist(1).map((str) => str.split(RegExp(r'\s+')))
      )
      if(row.length > 9)
      row[0] : IOBytes(int.parse(row[6], radix: 10), int.parse(row[9], radix: 10)) 
    };
    await Future.delayed(const Duration(milliseconds: timeInteval));
  }
}

Stream<Map<String, IOBytes>> fetchInstantBytesLinux() async* {
  while(true) {
    ProcessResult processResult = await Process.run('ifconfig', [], stdoutEncoding: Utf8Codec());
    String result = processResult.stdout;
    yield {
      for (
        RegExpMatch match in RegExp(r'^([^\s:]*): [\s\S]*?\n\s*RX[\s\S]*?bytes (\d*)[\s\S]*?\n\s*TX[\s\S]*?bytes (\d*)', multiLine: true).allMatches(result)
      )
      if(match.groupCount > 2) 
      match.group(1)!: IOBytes(num.parse(match.group(2)!), num.parse(match.group(3)!))
    };
    await Future.delayed(const Duration(milliseconds: timeInteval));
  }
}

String humanreadableBytes(num bytes) {
  bytes = bytes*100.round()/100;
  if(bytes < 1024) {
    return '$bytes B/s';
  }
  bytes = (bytes/1024*100).round()/100;
  if(bytes < 1024) {
    return '$bytes KB/s';
  }
  bytes = (bytes/1024*100).round()/100;
  if(bytes < 1024) {
    return '$bytes MB/s';
  }
  bytes = (bytes/1024*100).round()/100;
  return '$bytes GB/s';
}

Stream<String> dumpDeltaBytes(Stream<Map<String, IOBytes>> instantBytes) async* {
  Map<String, IOBytes>? previousMap;
  Map<String, IOBytes> currentMap;
  await for(currentMap in instantBytes) {
    if(previousMap == null) {
      previousMap = currentMap;
      continue;
    }

    String printStr = '';
    for(var interface in currentMap.keys) {
      var inBytes = currentMap[interface]!.inBytes - previousMap[interface]!.inBytes;
      var outBytes = currentMap[interface]!.outBytes - previousMap[interface]!.outBytes;
      printStr += '${interface.padRight(labelLength,' ')}In:${' '*leftPadLength+humanreadableBytes(inBytes)}'.padRight(outBytesOffset, ' ');
      printStr += 'Out:${' '*leftPadLength}${humanreadableBytes(outBytes)}\n';
    }
    yield printStr;
  }
}
