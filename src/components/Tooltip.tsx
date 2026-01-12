import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const TooltipContainer = styled.div<{
  $show: boolean;
  $position: "top" | "bottom";
  $align: "center" | "left" | "right";
}>`
  position: absolute;
  ${(props) => (props.$position === "top" ? "bottom: 100%;" : "top: 100%;")}

  ${(props) => {
    if (props.$align === "left")
      return (
        "left: 0; transform: translateY(" + (props.$show ? "0" : props.$position === "top" ? "5px" : "-5px") + ");"
      );
    if (props.$align === "right")
      return (
        "right: 0; transform: translateY(" + (props.$show ? "0" : props.$position === "top" ? "5px" : "-5px") + ");"
      );
    return (
      "left: 50%; transform: translateX(-50%) translateY(" +
      (props.$show ? "0" : props.$position === "top" ? "5px" : "-5px") +
      ");"
    );
  }}

  ${(props) => (props.$position === "top" ? "margin-bottom: 8px;" : "margin-top: 8px;")}
  padding: 6px 10px;
  background-color: rgba(20, 23, 34, 0.95);
  color: white !important;
  -webkit-text-fill-color: white !important;
  font-size: 11px;
  font-weight: 500;
  border-radius: 6px;
  white-space: normal;
  width: max-content;
  max-width: 180px;
  z-index: 9999;
  opacity: ${(props) => (props.$show ? 1 : 0)};
  visibility: ${(props) => (props.$show ? "visible" : "hidden")};
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  line-height: 1.4;
  text-transform: none;
  letter-spacing: normal;

  &::after {
    content: "";
    position: absolute;
    ${(props) => (props.$position === "top" ? "top: 100%;" : "bottom: 100%;")}

    ${(props) => {
      if (props.$align === "left") return "left: 20px;";
      if (props.$align === "right") return "right: 20px;";
      return "left: 50%; margin-left: -5px;";
    }}
    
    border-width: 5px;
    border-style: solid;
    border-color: ${(props) =>
      props.$position === "top"
        ? "rgba(20, 23, 34, 0.95) transparent transparent transparent"
        : "transparent transparent rgba(20, 23, 34, 0.95) transparent"};
  }
`;

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const [align, setAlign] = useState<"center" | "left" | "right">("center");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Vertical position
    if (rect.top < 60) {
      setPosition("bottom");
    } else {
      setPosition("top");
    }

    // Horizontal alignment
    const tooCloseToLeft = rect.left < 100;
    const tooCloseToRight = viewportWidth - rect.right < 100;

    if (tooCloseToLeft) {
      setAlign("left");
    } else if (tooCloseToRight) {
      setAlign("right");
    } else {
      setAlign("center");
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    calculatePosition(target);

    if (window.matchMedia("(hover: hover)").matches) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShow(true);
      }, 600);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    calculatePosition(target);

    if (!window.matchMedia("(hover: hover)").matches) {
      setShow((prev) => !prev);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShow(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  try {
    const child = React.Children.only(children) as React.ReactElement;

    return React.cloneElement(child, {
      onMouseEnter: (e: any) => {
        if (child.props.onMouseEnter) child.props.onMouseEnter(e);
        handleMouseEnter(e);
      },
      onMouseLeave: (e: any) => {
        if (child.props.onMouseLeave) child.props.onMouseLeave(e);
        handleMouseLeave();
      },
      onClick: (e: any) => {
        if (child.props.onClick) child.props.onClick(e);
        handleClick(e);
      },
      style: {
        ...child.props.style,
        position: "relative",
        display: child.props.style?.display || (child.type === "span" ? "inline-block" : undefined),
      },
      children: (
        <>
          {child.props.children}
          <TooltipContainer $show={show} $position={position} $align={align}>
            {text}
          </TooltipContainer>
        </>
      ),
    });
  } catch (e) {
    return (
      <div
        style={{ position: "relative", display: "inline-flex", verticalAlign: "middle" }}
        onMouseEnter={(e) => handleMouseEnter(e)}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => handleClick(e)}
      >
        {children}
        <TooltipContainer $show={show} $position={position} $align={align}>
          {text}
        </TooltipContainer>
      </div>
    );
  }
};

export default Tooltip;
