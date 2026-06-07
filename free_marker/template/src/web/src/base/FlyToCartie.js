const edit = true;

import React from "react";
// import { motion } from "framer-motion"; // 移除靜態 import，改為動態載入

export default class FlyToCartie extends React.Component {
    state = { MotionImg: null };

    componentDidUpdate(prevProps) {
        // 當 fly 從 false 變 true 時，動態載入 framer-motion
        if (this.props.fly && !prevProps.fly && !this.state.MotionImg) {
            import("framer-motion").then((mod) => {
                this.setState({ MotionImg: mod.motion.img });
            });
        }
    }

    handleComplete = () => {
        if (this.props.onComplete) {
            this.props.onComplete();
        }
    };

    render() {
        const { imageSrc, size = 80, direction = "rightTop", duration = 1.2, fly = false } = this.props;
        const { MotionImg } = this.state;

        // ✅ 若 fly 為 false 或 motion 尚未載入，不渲染
        if (!fly || !MotionImg) return null;

        const centerX = window.innerWidth / 2 - size / 2;
        const centerY = window.innerHeight / 2 - size / 2;

        let targetTop = -100;
        let targetLeft = window.innerWidth;

        if (direction === "leftTop") {
            targetTop = -100;
            targetLeft = -100;
        } else if (direction === "leftBottom") {
            targetTop = window.innerHeight;
            targetLeft = -100;
        } else if (direction === "rightBottom") {
            targetTop = window.innerHeight;
            targetLeft = window.innerWidth;
        }

        return (
            <MotionImg
                src={imageSrc}
                initial={{
                    position: "fixed",
                    top: centerY,
                    left: centerX,
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    objectFit: "cover",
                    zIndex: 9999,
                    opacity: 1,
                    scale: 1
                }}
                animate={{
                    top: targetTop,
                    left: targetLeft,
                    opacity: 0,
                    scale: 0.3
                }}
                transition={{ duration, ease: "easeInOut" }}
                style={{
                    borderRadius: "50%",
                    width: size,
                    height: size,
                    objectFit: "cover"
                }}
                onAnimationComplete={this.handleComplete}
            />
        );
    }
}
