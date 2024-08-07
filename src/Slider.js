import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
import styles from './styles.module.css'; // Assuming the styles are correctly set in CSS module

const left = {
  bg: `linear-gradient(120deg, #f093fb 0%, #f5576c 100%)`,
  justifySelf: 'end',
};

const right = {
  bg: `linear-gradient(120deg, #96fbc4 0%, #f9f586 100%)`,
  justifySelf: 'start',
};

const Slider = ({ children }) => {
  const [{ x, bg, scale, justifySelf }, api] = useSpring(() => ({
    x: 0,
    scale: 1,
    ...left,
  }));

  const bind = useDrag(({ active, movement: [mx] }) => api.start({
    x: active ? mx : 0,
    scale: active ? 1.1 : 1,
    ...(mx < 0 ? left : right),
    immediate: name => active && name === 'x',
  }));

  const avSize = x.to({
    map: Math.abs,
    range: [50, 300],
    output: [0.5, 1],
    extrapolate: 'clamp',
  });

  return (
    <animated.div {...bind()} className={styles.item} style={{ background: bg }}>
      <animated.div className={styles.av} style={{ scale: avSize, justifySelf }}>
      <h1 style={{color: 'black'}}>BHUPIN</h1>

      </animated.div>
      <animated.div className={styles.fg} style={{ x, scale }}>
        {children}
      </animated.div>
    </animated.div>
  );
};

export default Slider;
