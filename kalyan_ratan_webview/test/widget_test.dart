import 'package:flutter_test/flutter_test.dart';
import 'package:kalyan_ratan_webview/main.dart';

void main() {
  test('uses the production game URL', () {
    expect(initialUrl, 'https://game.kalyanratan777.com/');
    expect(appTitle, 'KalyanRatan777');
  });
}
