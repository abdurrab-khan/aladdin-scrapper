import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export default function ReviewStar({ rating, size }: { rating: number, size: number }) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const renderStar = (type: "full" | "half" | "empty", index: number) => {
        const starPath =
            "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z";

        return (
            <Svg
                key={index}
                width={size}
                height={size}
                viewBox="0 0 24 24"
                style={{ marginRight: 2 }}
            >
                {type === "half" && (
                    <Defs>
                        <LinearGradient
                            id={`halfGrad${index}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <Stop offset="50%" stopColor="#FFD700" />
                            <Stop offset="50%" stopColor="#E5E5E5" />
                        </LinearGradient>
                    </Defs>
                )}
                <Path
                    d={starPath}
                    fill={
                        type === "full"
                            ? "#FFD700"
                            : type === "half"
                                ? `url(#halfGrad${index})`
                                : "#E5E5E5"
                    }
                    stroke="#DDD"
                    strokeWidth={0.5}
                />
            </Svg>
        );
    };

    return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Render full stars */}
            {Array.from({ length: fullStars }, (_, index) =>
                renderStar("full", index)
            )}

            {/* Render half star if needed */}
            {hasHalfStar && renderStar("half", fullStars)}

            {/* Render empty stars */}
            {Array.from({ length: emptyStars }, (_, index) =>
                renderStar("empty", fullStars + (hasHalfStar ? 1 : 0) + index)
            )}
        </View>
    );
};