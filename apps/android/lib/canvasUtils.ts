import { SkCanvas, SkFont, Skia } from "@shopify/react-native-skia";

// Interface for position configuration
interface PositionConfig {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  hCenter?: number;
  vCenter?: number;
}

// Interface for caption generation parameters
interface CaptionParams {
  canvasWidth: number;
  canvasHeight: number;
  font: SkFont;
  text: string;
  position?: PositionConfig;
  textColor?: string;
  captionColor?: string;
  captionOpacity?: number;
  fontSizeRatio?: number;
  paddingRatio?: number;
  borderRadiusRatio?: number;
  fontWeight?: string;
  maxWidthRatio?: number;
  minFontSize?: number;
  minPadding?: number;
}

const wrapText = (
  textToWrap: string,
  fontInstance: SkFont,
  maxWidth: number
): string[] => {
  const words = textToWrap.split(" ");

  if (words.length === 0) return [];

  const wrappedLines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = `${currentLine} ${words[i]}`;

    if (fontInstance.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      wrappedLines.push(currentLine);
      currentLine = words[i];
    }
  }

  wrappedLines.push(currentLine);
  return wrappedLines;
};

/**
 * Generate caption with text positioned dynamically based on canvas size
 * @param {Object} params - Configuration object
 * @param {number} params.canvasWidth - Canvas width
 * @param {number} params.canvasHeight - Canvas height
 * @param {string} params.text - Text content for caption
 * @param {Object} params.position - Position object {top?, left?, right?, bottom?}
 * @param {string} params.textColor - Text color (default: '#FFFFFF')
 * @param {string} params.captionColor - Caption background color (default: '#000000')
 * @param {number} params.captionOpacity - Caption opacity 0-1 (default: 0.7)
 * @param {number} params.fontSizeRatio - Font size as ratio of canvas width (default: 0.04)
 * @param {number} params.paddingRatio - Caption padding as ratio of canvas width (default: 0.02)
 * @param {number} params.borderRadius - Border radius ratio (default: 0.01)
 * @param {string} params.fontWeight - Font weight (default: '500')
 * @param {number} params.maxWidthRatio - Max caption width as ratio of canvas (default: 0.8)
 * @returns {Object} Caption configuration object for Skia rendering
 */
function generateCaptionConfiguration({
  canvasWidth,
  canvasHeight,
  text,
  font,
  position = { hCenter: 0.5, top: 0.05 },
  textColor = "#FFFFFF",
  captionColor = "#000000",
  captionOpacity = 0.7,
  fontSizeRatio = 0.05,
  paddingRatio = 0.04,
  borderRadiusRatio = 0.01,
  maxWidthRatio = 0.9,
  minFontSize = 12,
  minPadding = 10,
}: CaptionParams) {
  // Early validation with single return
  if (!canvasWidth || !canvasHeight || !text || !font) {
    console.error(
      "Invalid parameters: canvas dimensions, text, and font are required."
    );
    return null;
  }

  // Pre-calculate constants
  const minDimension = Math.min(canvasWidth, canvasHeight);
  const horizontalPadding = Math.max(minPadding, canvasWidth * paddingRatio);
  const verticalPadding = horizontalPadding * 0.5;
  const maxTextWidth = canvasWidth * maxWidthRatio - horizontalPadding * 2;
  const borderRadius = Math.max(4, minDimension * borderRadiusRatio);

  // --- 1. Find Optimal Font Size with Binary Search Approach ---
  let currentFontSize = Math.max(minFontSize, minDimension * fontSizeRatio);
  let lines: string[] = [];
  let textBlockWidth = 0;

  // Use a more efficient approach - start high and decrease by larger steps initially
  let stepSize = Math.max(1, Math.floor(currentFontSize * 0.1));

  while (currentFontSize >= minFontSize) {
    font.setSize(currentFontSize);
    lines = wrapText(text, font, maxTextWidth);

    // Single pass to find max width
    textBlockWidth = 0;
    for (const line of lines) {
      const lineWidth = font.measureText(line).width;
      if (lineWidth > textBlockWidth) {
        textBlockWidth = lineWidth;
      }
    }

    if (textBlockWidth <= maxTextWidth) break;

    // Adaptive step size - larger steps when far from target
    currentFontSize -= stepSize;
    if (currentFontSize < minFontSize + stepSize && stepSize > 1) {
      stepSize = 1; // Fine-tune with smaller steps near the end
    }
  }

  // Ensure minimum font size
  if (currentFontSize < minFontSize) {
    currentFontSize = minFontSize;
    font.setSize(currentFontSize);
    lines = wrapText(text, font, maxTextWidth);

    textBlockWidth = 0;
    for (const line of lines) {
      const lineWidth = font.measureText(line).width;
      if (lineWidth > textBlockWidth) {
        textBlockWidth = lineWidth;
      }
    }
  }

  // --- 2. Calculate Dimensions ---
  const fontMetrics = font.getMetrics();
  const lineHeight =
    Math.abs(fontMetrics.ascent) +
    fontMetrics.descent +
    (fontMetrics.leading || 0);
  const textBlockHeight =
    lineHeight * lines.length - (fontMetrics.leading || 0);

  const captionWidth = textBlockWidth + horizontalPadding * 2;
  const captionHeight = textBlockHeight + verticalPadding * 2;

  // --- 3. Calculate Position (streamlined logic) ---
  const captionX = Math.max(
    0,
    Math.min(
      position.left !== undefined
        ? canvasWidth * position.left
        : position.right !== undefined
        ? canvasWidth * (1 - position.right) - captionWidth
        : position.hCenter !== undefined
        ? canvasWidth * position.hCenter - captionWidth / 2
        : (canvasWidth - captionWidth) / 2,
      canvasWidth - captionWidth
    )
  );

  const captionY = Math.max(
    0,
    Math.min(
      position.top !== undefined
        ? canvasHeight * position.top
        : position.bottom !== undefined
        ? canvasHeight * (1 - position.bottom) - captionHeight
        : position.vCenter !== undefined
        ? canvasHeight * position.vCenter - captionHeight / 2
        : canvasHeight * 0.05,
      canvasHeight - captionHeight
    )
  );

  // --- 4. Calculate Text Position ---
  const textX = captionX + horizontalPadding;
  const textY = captionY + verticalPadding + Math.abs(fontMetrics.ascent);

  return {
    captionRect: {
      x: captionX,
      y: captionY,
      width: captionWidth,
      height: captionHeight,
      color: captionColor,
      opacity: captionOpacity,
      borderRadius,
    },
    textConfig: {
      text: lines.join("\n"),
      x: textX,
      y: textY,
      font,
      color: textColor,
      maxWidth: textBlockWidth,
    },
    dimensions: {
      captionWidth,
      captionHeight,
      textBlockWidth,
      textBlockHeight,
      fontSize: currentFontSize,
      padding: { horizontal: horizontalPadding, vertical: verticalPadding },
    },
  };
}
// Enhanced version with better font handling
function drawCaptionOnCanvasAdvanced(
  canvas: SkCanvas,
  captionConfig: Record<string, any>,
  fontData: SkFont
) {
  const { captionRect, textConfig } = captionConfig;

  // Validate captionConfig structure
  if (!captionRect || !textConfig) {
    console.error("Invalid captionConfig: missing captionRect or textConfig");
    return;
  }

  // Create paint for caption background
  const captionPaint = Skia.Paint();
  try {
    captionPaint.setColor(Skia.Color(captionRect.color || "#000000"));
    captionPaint.setAlphaf(Math.round((captionRect.opacity || 0.7) * 255));
    captionPaint.setAntiAlias(true);
  } catch (error) {
    console.error("Error setting caption paint color:", error);
    captionPaint.setColor(Skia.Color("#000000")); // Fallback to black
    captionPaint.setAlphaf(Math.round(0.7 * 255));
    captionPaint.setAntiAlias(true);
  }

  // Draw caption background (rounded rectangle)
  const captionPath = Skia.Path.Make();
  captionPath.addRRect(
    Skia.RRectXY(
      Skia.XYWHRect(
        captionRect.x || 0,
        captionRect.y || 0,
        captionRect.width || 100,
        captionRect.height || 30
      ),
      captionRect.borderRadius || 4,
      captionRect.borderRadius || 4
    )
  );

  canvas.drawPath(captionPath, captionPaint);

  // Create paint for caption text
  const textPaint = Skia.Paint();
  try {
    textPaint.setColor(Skia.Color(textConfig.color || "#FFFFFF"));
    textPaint.setAlphaf(Math.round((textConfig.opacity || 0.7) * 255));
    textPaint.setAntiAlias(true);
  } catch (error) {
    textPaint.setColor(Skia.Color("#000000")); // Fallback to black
    textPaint.setAlphaf(Math.round(0.7 * 255));
    textPaint.setAntiAlias(true);
  }

  canvas.drawText(
    textConfig?.text,
    captionConfig?.textConfig?.x,
    captionConfig?.textConfig?.y,
    textPaint,
    fontData
  );
}

export { drawCaptionOnCanvasAdvanced, generateCaptionConfiguration };
