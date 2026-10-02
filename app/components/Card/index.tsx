import React, { memo } from 'react';
import styles from './Card.module.css';

interface CardProps {
    image: string;
    alt: string;
    draggable: boolean;
    columnIndex: number;
    cardIndex: number;
    onDragStart: (e: React.DragEvent, columnIndex: number, cardIndex: number) => void;
    onDragEnd: (e: React.DragEvent) => void;
}

// Props are primitives plus stable callbacks, so memo skips cards that didn't change
const Card = memo(function Card({ image, alt, draggable, columnIndex, cardIndex, onDragStart, onDragEnd }: CardProps) {
    return (
        <div
            className={styles.card}
            draggable={draggable}
            onDragStart={(e) => onDragStart(e, columnIndex, cardIndex)}
            onDragEnd={onDragEnd}
        >
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny preloaded pixel-art sprites; next/image's optimizer only adds latency */}
            <img src={image} width={68} height={100} alt={alt} draggable={false} />
        </div>
    )
})

export default Card;
