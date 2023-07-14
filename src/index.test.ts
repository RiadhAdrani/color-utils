import { it, expect, describe } from 'vitest';

import {
  convertColor,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
  ColorType,
  RGB,
  HSL,
  HEX,
  changeColorOpacity,
  generateColorTonalPalette,
  generateComplementaryColor,
  generateContrastSafeColor,
  getColorType,
  isHexColor,
  isHslaForm,
  isHslForm,
  extractDataFromHSL,
  isHslColor,
  isRgbColor,
  isRgbaForm,
  extractDataFromRGB,
  isRgbForm,
} from './index.js';

describe('convertColor', () => {
  it.each([
    [
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [90, 50, 50],
      [128, 191, 64],
    ],
    [
      [180, 32, 95],
      [238, 246, 246],
    ],
    [
      [360, 100, 100],
      [255, 255, 255],
    ],
  ])('should convert HSL to RGB', (color: number[], expected: number[]) => {
    expect(hslToRgb(color[0], color[1], color[2])).toStrictEqual(expected);
  });

  it.each([
    [
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [128, 191, 64],
      [90, 49.8, 50],
    ],
    [
      [238, 246, 246],
      [180, 30.77, 94.9],
    ],
    [
      [255, 255, 255],
      [0, 0, 100],
    ],
  ])('should convert RGB to HEX', (color: number[], expected: number[]) => {
    expect(rgbToHsl(color[0], color[1], color[2])).toStrictEqual(expected);
  });

  it.each([
    [[0, 0, 0], '#000000ff'],
    [[128, 191, 64], '#80bf40ff'],
    [[238, 246, 246], '#eef6f6ff'],
    [[255, 255, 255], '#ffffffff'],
  ])('should convert RGB to HEX', (color, expected) => {
    expect(rgbToHex(color[0], color[1], color[2])).toStrictEqual(expected);
  });

  it.each([
    ['red'],
    ['123'],
    ['#12'],
    ['red-yellow'],
    ['#15689'],
    ['rgb(1,x,13)'],
    ['hsla(#ff,#aa)'],
  ])('should return the input if the color type is unknown', color => {
    expect(convertColor(color, 'hex')).toBe(color);
  });

  it.each([['hexa'], ['rrggbb'], ['unknown'], ['cyq']])(
    'should return the input if the target type is unknown',
    type => {
      expect(convertColor('red', type as ColorType)).toBe('red');
    }
  );

  it.each([
    ['rgb(0,0,0)', 'rgb'],
    ['rgba(0,0,0,1)', 'rgb'],
    ['hsl(0deg 0% 0%)', 'hsl'],
    ['hsla(0deg 0% 0% / 1)', 'hsl'],
    ['#ccc', 'hex'],
    ['#121212', 'hex'],
    ['#12121299', 'hex'],
  ])('should return the input if the target type is the same', (color, type) => {
    expect(convertColor(color, type as ColorType)).toBe(color);
  });

  it.each([
    ['#000', 'rgba(0,0,0,1)'],
    ['#abc', 'rgba(170,187,204,1)'],
    ['#121212', 'rgba(18,18,18,1)'],
    ['#ababab', 'rgba(171,171,171,1)'],
    ['#ababab22', 'rgba(171,171,171,0.13)'],
    ['#8f5aeecc', 'rgba(143,90,238,0.8)'],
  ])('should convert hex to rgb : %s => %s', (color, expected) => {
    expect(convertColor(color, RGB)).toBe(expected);
  });

  it.each([
    ['#000', 'hsla(0deg 0% 0% / 1)'],
    ['#abc', 'hsla(210deg 25% 73.33% / 1)'],
    ['#ff0000', 'hsla(0deg 100% 50% / 1)'],
    ['#ff0000ab', 'hsla(0deg 100% 50% / 0.67)'],
    ['#ababab', 'hsla(0deg 0% 67.06% / 1)'],
    ['#ababab22', 'hsla(0deg 0% 67.06% / 0.13)'],
    ['#8f5aeecc', 'hsla(261deg 81.32% 64.31% / 0.8)'],
  ])('should convert hex to hsl : %s => %s', (color, expected) => {
    expect(convertColor(color, HSL)).toBe(expected);
  });

  it.each([
    ['rgb(0,0,0)', 'hsla(0deg 0% 0% / 1)'],
    ['rgb(50,120,70)', 'hsla(137deg 41.18% 33.33% / 1)'],
    ['rgb(20,40,60)', 'hsla(210deg 50% 15.69% / 1)'],
    ['rgb(255,255,255)', 'hsla(0deg 0% 100% / 1)'],
  ])('should convert rgb to hsl : %s => %s', (color, expected) => {
    expect(convertColor(color, HSL)).toBe(expected);
  });

  it.each([
    ['rgba(0,0,0,1)', '#000000ff'],
    ['rgba(170,187,204,1)', '#aabbccff'],
    ['rgba(18,18,18,1)', '#121212ff'],
    ['rgba(171,171,171,1)', '#abababff'],
    ['rgba(171,171,171,0.13)', '#ababab21'],
    ['rgba(143,90,238,0.8)', '#8f5aeecc'],
  ])('should convert rgb to hex : %s => %s', (color, expected) => {
    expect(convertColor(color, HEX)).toBe(expected);
  });

  it.each([
    ['hsl(0deg 0% 0%)', '#000000ff'],
    ['hsl(210deg 25% 73%)', '#a9bacbff'],
    ['hsl(0deg 100% 50%)', '#ff0000ff'],
    ['hsla(0deg 100% 50% / 0.67)', '#ff0000ab'],
    ['hsla(0deg 0% 67% / 1)', '#abababff'],
    ['hsla(0deg 0% 67% / 0.13)', '#ababab21'],
    ['hsla(261deg 81% 64% / 0.8)', '#8d59eecc'],
  ])('should convert hsl to hex : %s => %s', (color, expected) => {
    expect(convertColor(color, HEX)).toBe(expected);
  });

  it.each([
    ['hsl(0deg 0% 0%)', 'rgba(0,0,0,1)'],
    ['hsl(137deg 41% 33%)', 'rgba(50,119,69,1)'],
    ['hsla(210deg 50% 15% / 0.5)', 'rgba(19,38,57,0.5)'],
    ['hsla(0deg 0% 100% / 1)', 'rgba(255,255,255,1)'],
    ['hsla(0deg 0% 100% / 0.33)', 'rgba(255,255,255,0.33)'],
  ])('should convert hsl to rgb : %s => %s', (color, expected) => {
    expect(convertColor(color, RGB)).toBe(expected);
  });
});

describe('generateColor', () => {
  it.each([
    ['#fff', '#000'],
    ['#000', '#fff'],
    ['#f00', '#fff'],
    ['#0f0', '#000'],
    ['#00f', '#fff'],
    ['#f0f', '#fff'],
    ['#0ff', '#000'],
    ['#4b4400', '#fff'],
    ['#b5b5b5', '#000'],
  ])('should generate safe color : %s', (input, expected) => {
    expect(generateContrastSafeColor(input)).toBe(expected);
  });

  it.each([
    ['#000', '#000000ff'],
    ['#fff', '#ffffffff'],
    ['#20dfdf', '#df2020ff'],
    ['#dfbf20', '#2040dfff'],
    ['#df20df', '#20df20ff'],
    ['#df20df2e', '#20df202e'],
  ])('should generate complementary color (%s) -> (%s)', (source, expected) => {
    expect(generateComplementaryColor(source, 'hex')).toBe(expected);
  });

  it.each([
    [
      '#000',
      {
        0: '#000000ff',
        10: '#1a1a1aff',
        20: '#333333ff',
        30: '#4d4d4dff',
        40: '#666666ff',
        50: '#808080ff',
        60: '#999999ff',
        70: '#b3b3b3ff',
        80: '#ccccccff',
        90: '#e6e6e6ff',
        95: '#f2f2f2ff',
        99: '#fcfcfcff',
        100: '#ffffffff',
      },
    ],
    [
      '#fff',
      {
        0: '#000000ff',
        10: '#1a1a1aff',
        20: '#333333ff',
        30: '#4d4d4dff',
        40: '#666666ff',
        50: '#808080ff',
        60: '#999999ff',
        70: '#b3b3b3ff',
        80: '#ccccccff',
        90: '#e6e6e6ff',
        95: '#f2f2f2ff',
        99: '#fcfcfcff',
        100: '#ffffffff',
      },
    ],
    [
      '#d46c5e',
      {
        0: '#000000ff',
        10: '#280e0bff',
        20: '#501c16ff',
        30: '#792b20ff',
        40: '#a1392bff',
        50: '#c94736ff',
        60: '#d46c5eff',
        70: '#df9186ff',
        80: '#e9b5afff',
        90: '#f4dad7ff',
        95: '#faedebff',
        99: '#fefbfbff',
        100: '#ffffffff',
      },
    ],
  ])('should generate color palette (%s)', (source, expected) => {
    expect(generateColorTonalPalette(source, 'hex')).toStrictEqual(expected);
  });

  it.each([
    ['#000', 0, '#00000000'],
    ['#fff', 0.5, '#ffffff80'],
    ['#1e1e1e55', 0.8, '#1e1e1ecc'],
  ])('should generate complementary color (%s) -> (%s)', (source, opacity, expected) => {
    expect(changeColorOpacity(source, opacity)).toBe(expected);
  });
});

describe('getColorType', () => {
  it.each([
    ['red', 'unknown'],
    ['rgb(1,2,3)', 'rgb'],
    ['rgba(1,2,3,0.5)', 'rgb'],
    ['hsl(1deg 2% 3%)', 'hsl'],
    ['hsla(360deg 2% 3% / 0.5)', 'hsl'],
    ['#000', 'hex'],
    ['#111111', 'hex'],
    ['#aaaaaaaa', 'hex'],
  ])('should return the correct type (%s)', (color, expected) => {
    expect(getColorType(color as string)).toBe(expected);
  });
});

describe('isHex', () => {
  it.each([
    ['', false],
    ['#', false],
    ['#1', false],
    ['#12', false],
    ['#1 2', false],
    ['#1g2', false],
    ['#abc', true],
    ['#aBc', true],
    ['#132', true],
    ['#1a3', true],
    ['#1A3', true],
    ['#1a32', false],
    ['#1a323', false],
    ['#1a323a', true],
    ['#1a323A', true],
    ['#1a323a3', false],
    ['#1a323acc', true],
    ['#1A323ACC', true],
  ])('should determine if (%s) is a hex color value, expected : (%s)', (input, expected) => {
    expect(isHexColor(input as string)).toBe(expected);
  });
});

describe('isHSLColor', () => {
  it.each([
    ['', false],
    ['hsl(10deg 5% 10% 1)', false],
    ['hsl(10deg % 10% 1)', false],
    ['hsl(deg 5% 10% 1)', false],
    ['hsl(10deg 5% % 1)', false],
    ['hsl(3000deg 100% 100%)', false],
    ['hsl(300deg 1000% 100%)', false],
    ['hsl(300deg 100% 1000%)', false],
    ['hsl(10deg 5% 10%)', true],
    ['hsl(10.5deg 5.5% 10.5%)', true],
  ])('should detect if a string is a hsl form : %s', (color, expected) => {
    expect(isHslForm(color)).toBe(expected);
  });

  it.each([
    ['', false],
    ['hsl(10deg 5% 10% 1)', false],
    ['hsl(10deg % 10% 1)', false],
    ['hsl(deg 5% 10% 1)', false],
    ['hsl(10deg 5% % 1)', false],
    ['hsl(3000deg 100% 100%)', false],
    ['hsl(300deg 1000% 100%)', false],
    ['hsl(300deg 100% 1000%)', false],
    ['hsla(10deg 5% 10% / 1)', true],
    ['hsla(10.5deg 5.5% 10.5% / 0.5)', true],
  ])('should extract data from hsl/hsla : %s', (color, expected) => {
    expect(isHslaForm(color)).toBe(expected);
  });

  it.each([
    ['hsla(10deg 5% 10% / 1)', [10, 5, 10, 1]],
    ['hsl(10deg 2.55% 10%)', [10, 2.55, 10]],
  ])('should detect if a string is a hsla form : %s', (color, expected) => {
    expect(extractDataFromHSL(color)).toStrictEqual(expected);
  });

  it('should throw an error when the hsl form is not detected', () => {
    expect(() => extractDataFromHSL('hsl()')).toThrow();
  });

  it.each([
    ['hsl (255 255 255)'],
    ['hsla (255 255 255)'],

    ['hsl( 0 255 255)'],
    ['hsla( 0 255 255)'],

    ['hsl(-1 255 255)'],
    ['hsla(-1 255 255)'],

    ['hsl(361 0 0)'],
    ['hsla(361 0 0)'],

    ['hsl(255 101  255)'],
    ['hsla(255,101  255)'],

    ['hsl(255 -1 255)'],
    ['hsla(255 -1 255)'],

    ['hsl(255 257 255)'],
    ['hsla(255 257 255)'],

    ['hsl(255 255 255 )'],
    ['hsla(255 255 255 )'],

    ['hsl(255 255 -1)'],
    ['hsla(255 255 -1)'],

    ['hsl(255 255 257)'],
    ['hsla(255 255 257)'],

    ['hsla(255 255 257 1 )'],
    ['hsla(255 255 257 1.1)'],
    ['hsla(255 255 257 -0.1)'],
  ])('should refuse bad forms %s', value => {
    expect(isHslColor(value)).toBe(false);
  });

  it.each([
    ['hsl(10.5deg 10% 10%)'],
    ['hsl(10.235deg 10% 10%)'],
    ['hsl(100.89deg 10% 10%)'],
    ['hsl(360deg 10% 10%)'],

    ['hsla(100deg 100% 100%)'],

    ['hsla(360deg 75% 50%)'],
    ['hsla(256deg 75% 50%)'],
    ['hsla(256deg 30% 50%)'],
    ['hsla(360deg 100% 0%)'],

    ['hsla(0deg 10% 55% / 1)'],
    ['hsla(360deg 25% 25% / 0)'],
    ['hsla(360deg 25% 25% / 1)'],
    ['hsla(360deg 25% 25% / 0)'],
    ['hsla(360deg 25% 25% / 0.1)'],
    ['hsla(360deg 25% 25% / 0.105975)'],
    ['hsla(360deg 25% 25% / 0.254725)'],
  ])('should accept good forms %s', value => {
    expect(isHslColor(value)).toBe(true);
  });
});

describe('isRgbColor', () => {
  it.each([
    ['', false],
    ['rgb(10, 5, 10, 1)', false],
    ['rgb(10, , 10, 1)', false],
    ['rgb(, 5, 10, 1)', false],
    ['rgb(10, 5, , 1)', false],
    ['rgb(3000, 100,100)', false],
    ['rgb(300, 1000, 100,)', false],
    ['rgb(300, 100, 1000,)', false],
    ['rgb(10, 5, 10)', true],
    ['rgb(10.5, 5.5, 10.5)', true],
  ])('should detect rgb form : %s', (color, expected) => {
    expect(isRgbForm(color)).toBe(expected);
  });

  it.each([
    ['', false],
    ['rgba(10, , 10, 1)', false],
    ['rgba(, 5, 10, 1)', false],
    ['rgba(10, 5, , 1)', false],
    ['rgba(3000, 100, 100%)', false],
    ['rgba(300, 1000, 100%)', false],
    ['rgba(300, 100, 1000%)', false],
    ['rgba(10, 5, 10, 0.26)', true],
    ['rgba(10.5, 5.5, 10.5, 1)', true],
  ])('should detect rgba form : %s', (color, expected) => {
    expect(isRgbaForm(color)).toBe(expected);
  });

  it.each([
    ['rgba(10, 5, 10, 0.5)', [10, 5, 10, 0.5]],
    ['rgb(10, 2.55, 10)', [10, 2.55, 10]],
  ])('should extract rgb data : %s', (color, expected) => {
    expect(extractDataFromRGB(color)).toStrictEqual(expected);
  });

  it('should throw an error when the rgb form is not detected', () => {
    expect(() => extractDataFromRGB('rgb()')).toThrow();
  });

  it.each([
    ['rgb (255,255,255)'],
    ['rgba (255,255,255)'],

    ['rgb( 0,255,255)'],
    ['rgba( 0,255,255)'],

    ['rgb(-1,255,255)'],
    ['rgba(-1,255,255)'],

    ['rgb(257,255,255)'],
    ['rgba(257,255,255)'],

    ['rgb(255,255 ,255)'],
    ['rgba(255,255 ,255)'],

    ['rgb(255,-1,255)'],
    ['rgba(255,-1,255)'],

    ['rgb(255,257,255)'],
    ['rgba(255,257,255)'],

    ['rgb(255,255,255 )'],
    ['rgba(255,255,255 )'],

    ['rgb(255,255,-1)'],
    ['rgba(255,255,-1)'],

    ['rgb(255,255,257)'],
    ['rgba(255,255,257)'],

    ['rgba(255,255,257,1 )'],
    ['rgba(255,255,257,1.1)'],
    ['rgba(255,255,257,-0.1)'],
  ])('should refuse bad forms (%s)', value => {
    expect(isRgbColor(value)).toBe(false);
  });

  it.each([
    ['rgb(0,0,0)'],
    ['rgb(0, 0,0)'],
    ['rgb(0, 0, 0)'],
    ['rgb(0,0, 0)'],

    ['rgb(1,1,1)'],
    ['rgb(1, 1,1)'],
    ['rgb(1, 1, 1)'],
    ['rgb(1,1, 1)'],

    ['rgb(10,10,10)'],
    ['rgb(10, 10,10)'],
    ['rgb(10, 10, 10)'],
    ['rgb(10,10, 10)'],

    ['rgb(100,100,100)'],
    ['rgb(100, 100,100)'],
    ['rgb(100, 100, 100)'],
    ['rgb(100,100, 100)'],

    ['rgb(256,256,256)'],
    ['rgb(256, 256,256)'],
    ['rgb(256, 256, 256)'],
    ['rgb(256,256, 256)'],

    ['rgba(0,0,0)'],
    ['rgba(0, 0,0)'],
    ['rgba(0, 0, 0)'],
    ['rgba(0,0, 0)'],

    ['rgba(1,1,1)'],
    ['rgba(1, 1,1)'],
    ['rgba(1, 1, 1)'],
    ['rgba(1,1, 1)'],

    ['rgba(10,10,10)'],
    ['rgba(10, 10,10)'],
    ['rgba(10, 10, 10)'],
    ['rgba(10,10, 10)'],

    ['rgba(100,100,100)'],
    ['rgba(100, 100,100)'],
    ['rgba(100, 100, 100)'],
    ['rgba(100,100, 100)'],

    ['rgba(256,256,256)'],
    ['rgba(256, 256,256)'],
    ['rgba(256, 256, 256)'],
    ['rgba(256,256, 256)'],

    ['rgba(256,256,256,1)'],
    ['rgba(256,256,256,0)'],
    ['rgba(256,256,256, 1)'],
    ['rgba(256,256,256, 0)'],
    ['rgba(256,256,256,0.1)'],
    ['rgba(256,256,256,0.105975)'],
    ['rgba(256,256,256, 0.254725)'],
  ])('should accept good forms (%s)', value => {
    expect(isRgbColor(value)).toBe(true);
  });
});
