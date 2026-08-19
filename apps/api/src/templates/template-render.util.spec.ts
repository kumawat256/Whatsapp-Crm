import {
  contactVariables,
  extractVariables,
  renderTemplate,
} from './template-render.util';

describe('template-render.util', () => {
  describe('extractVariables', () => {
    it('finds unique variable names in order of first appearance', () => {
      expect(
        extractVariables(
          'Hi {{firstName}}, your order {{orderId}} for {{firstName}} is ready',
        ),
      ).toEqual(['firstName', 'orderId']);
    });

    it('returns an empty array when there are no variables', () => {
      expect(extractVariables('Hello there!')).toEqual([]);
    });

    it('tolerates whitespace inside the braces', () => {
      expect(extractVariables('Hi {{ firstName }}!')).toEqual(['firstName']);
    });
  });

  describe('renderTemplate', () => {
    it('substitutes all provided variables', () => {
      const result = renderTemplate('Hi {{firstName}} {{lastName}}!', {
        firstName: 'Ada',
        lastName: 'Lovelace',
      });
      expect(result.text).toBe('Hi Ada Lovelace!');
      expect(result.missing).toEqual([]);
    });

    it('replaces missing variables with an empty string and reports them', () => {
      const result = renderTemplate('Hi {{firstName}}, code: {{promoCode}}', {
        firstName: 'Ada',
      });
      expect(result.text).toBe('Hi Ada, code: ');
      expect(result.missing).toEqual(['promoCode']);
    });

    it('treats null/empty values the same as missing', () => {
      const result = renderTemplate('{{a}}-{{b}}-{{c}}', {
        a: '',
        b: null,
        c: undefined,
      });
      expect(result.text).toBe('--');
      expect(result.missing).toEqual(['a', 'b', 'c']);
    });
  });

  describe('contactVariables', () => {
    it('maps standard contact fields, defaulting nullable ones to empty strings', () => {
      expect(
        contactVariables({
          firstName: 'Ada',
          lastName: null,
          phoneNumber: '+15551234567',
        }),
      ).toEqual({
        firstName: 'Ada',
        lastName: '',
        phoneNumber: '+15551234567',
      });
    });
  });
});
