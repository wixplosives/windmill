import React from 'react';
import { classes } from './image.st.css';

export interface IImageProps {
    src: string;
    alt?: string;
}

export const Image: React.FC<IImageProps> = ({ src, alt }: IImageProps) => {
    return <img className={classes.root} src={src} alt={alt} />;
};
