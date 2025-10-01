"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface WobbleCardProps {
  containerClassName?: string;
  children?: React.ReactNode;
  className?: string;
}

export const WobbleCard = ({
  children,
  containerClassName,
  className,
  style,
}: WobbleCardProps & { style?: React.CSSProperties }) => {
  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className={cn("relative", containerClassName)}
    >
      <motion.div
        variants={{
          initial: {
            rotate: 0,
          },
          animate: {
            rotate: 1,
          },
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        style={style}
        className={cn("relative rounded-2xl p-4", className)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
