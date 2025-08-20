import { describe, it, expect, vi } from 'vitest';

describe('Basic Tests', () => {
  it('should pass basic arithmetic', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(15 / 3).toBe(5);
  });

  it('should handle strings', () => {
    expect('hello').toBe('hello');
    expect('world').toContain('or');
    expect('test').toHaveLength(4);
  });

  it('should handle arrays', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
    expect(arr[0]).toBe(1);
  });

  it('should handle objects', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(42);
    expect(obj).toHaveProperty('name');
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  it('should handle mocks', () => {
    const mockFn = vi.fn().mockReturnValue('mocked');
    expect(mockFn()).toBe('mocked');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should handle environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});

describe('Error Handling', () => {
  it('should throw errors when expected', () => {
    expect(() => {
      throw new Error('Test error');
    }).toThrow('Test error');
  });

  it('should handle async errors', async () => {
    await expect(Promise.reject(new Error('Async error'))).rejects.toThrow('Async error');
  });
});

describe('TypeScript Support', () => {
  it('should handle TypeScript types', () => {
    const number: number = 42;
    const string: string = 'hello';
    const boolean: boolean = true;
    
    expect(typeof number).toBe('number');
    expect(typeof string).toBe('string');
    expect(typeof boolean).toBe('boolean');
  });
});
