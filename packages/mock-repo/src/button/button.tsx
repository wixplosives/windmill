import React, { FC } from 'react';
import { classes, style } from './button.st.css';

export const Button: FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = props => (
    <button {...props} className={style(classes.root, {}, props.className)} />
);
