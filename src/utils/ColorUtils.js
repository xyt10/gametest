/**
 * 颜色工具集
 * 提供颜色解析与透明度处理的高性能方法
 */

const ColorUtils = (() => {
    const colorCache = new Map();

    const clampChannel = (value) => {
        if (Number.isNaN(value)) {
            return 255;
        }
        return Math.max(0, Math.min(255, Math.round(value)));
    };

    const parseHex = (hex) => {
        if (!hex) {
            return { r: 255, g: 255, b: 255 };
        }
        let sanitized = hex.replace('#', '').trim();
        if (sanitized.length === 3) {
            sanitized = sanitized.split('').map((ch) => ch + ch).join('');
        }
        if (sanitized.length === 8) {
            sanitized = sanitized.substring(0, 6);
        }
        if (sanitized.length !== 6) {
            return { r: 255, g: 255, b: 255 };
        }
        const intVal = parseInt(sanitized, 16);
        if (Number.isNaN(intVal)) {
            return { r: 255, g: 255, b: 255 };
        }
        return {
            r: (intVal >> 16) & 255,
            g: (intVal >> 8) & 255,
            b: intVal & 255,
        };
    };

    const parseRgb = (color) => {
        const match = color.match(/rgba?\(([^)]+)\)/i);
        if (!match) {
            return null;
        }
        const parts = match[1].split(',').map((part) => parseFloat(part.trim()));
        if (parts.length < 3) {
            return null;
        }
        return {
            r: clampChannel(parts[0]),
            g: clampChannel(parts[1]),
            b: clampChannel(parts[2]),
        };
    };

    const parseColor = (color) => {
        if (!color) {
            return { r: 255, g: 255, b: 255 };
        }
        const normalized = color.toString().trim().toLowerCase();
        if (colorCache.has(normalized)) {
            return colorCache.get(normalized);
        }

        let result;
        if (normalized.startsWith('#')) {
            result = parseHex(normalized);
        } else if (normalized.startsWith('rgb')) {
            result = parseRgb(normalized) || { r: 255, g: 255, b: 255 };
        } else {
            result = parseHex(normalized);
        }

        colorCache.set(normalized, result);
        return result;
    };

    const toRgbaString = (components, alpha) => {
        const safe = components || {};
        const r = clampChannel(safe.r);
        const g = clampChannel(safe.g);
        const b = clampChannel(safe.b);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const resolveColorWithAlpha = (color, alpha) => {
        const components = parseColor(color);
        return toRgbaString(components, alpha);
    };

    const hexToRgba = (hex, alpha) => {
        return toRgbaString(parseHex(hex), alpha);
    };

    const clearCache = () => {
        colorCache.clear();
    };

    return {
        resolveColorWithAlpha,
        hexToRgba,
        toRgbaString,
        parseColor,
        clearCache,
    };
})();

if (typeof window !== 'undefined') {
    window.ColorUtils = ColorUtils;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorUtils;
}
