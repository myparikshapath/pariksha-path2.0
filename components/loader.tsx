// "use client";
// import { useEffect, useState } from "react";

// export default function Loader() {
//     const [progress, setProgress] = useState(0);
//     const [dotOffset, setDotOffset] = useState(0);

//     const dots = 5; // number of jumping dots

//     useEffect(() => {
//         // Animate progress
//         const progressInterval = setInterval(() => {
//             setProgress((prev) => {
//                 if (prev >= 100) {
//                     clearInterval(progressInterval);
//                     return 100;
//                 }
//                 return prev + 1; // ~4-5 seconds to complete
//             });
//         }, 50);

//         // Animate dot jump
//         const dotInterval = setInterval(() => {
//             setDotOffset((prev) => (prev + 1) % dots);
//         }, 200);

//         return () => {
//             clearInterval(progressInterval);
//             clearInterval(dotInterval);
//         };
//     }, []);

//     return (
//         <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
//             {/* Jumping dots */}
//             <div className="flex space-x-2 mb-6 h-4">
//                 {Array.from({ length: dots }).map((_, i) => (
//                     <div
//                         key={i}
//                         className={`w-4 h-4 rounded-full bg-green-500 transition-all duration-200`}
//                         style={{
//                             transform: `translateY(${i === dotOffset ? -10 : 0}px)`,
//                             background:
//                                 i === dotOffset
//                                     ? "linear-gradient(to right, #2E4A3C, yellow-400)"
//                                     : "#22c55e",
//                         }}
//                     />
//                 ))}
//             </div>

//             {/* Gradient progress bar */}
//             <div className="w-64 h-3 rounded-full overflow-hidden bg-gray-200">
//                 <div
//                     className="h-full transition-all duration-200 ease-linear"
//                     style={{
//                         width: `${progress}%`,
//                         background: "linear-gradient(to right, #22c55e, #facc15)",
//                     }}
//                 />
//             </div>
//         </div>
//     );
// }


"use client";
import React from "react";
import styled from "styled-components";

const Loader = () => {
    return (
        <Overlay>
            <StyledWrapper>
                <div className="boxes">
                    <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                    <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                    <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                    <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                </div>
            </StyledWrapper>
        </Overlay>
    );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white; /* Optional */
  z-index: 9999;
`;

const StyledWrapper = styled.div`
  .boxes {
    --size: 32px;
    --duration: 800ms;
    height: calc(var(--size) * 2);
    width: calc(var(--size) * 3);
    position: relative;
    transform-style: preserve-3d;
    transform-origin: 50% 50%;
    margin-top: calc(var(--size) * 1.5 * -1);
    transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px);
  }

  .boxes .box {
    width: var(--size);
    height: var(--size);
    top: 0;
    left: 0;
    position: absolute;
    transform-style: preserve-3d;
  }

  .boxes .box:nth-child(1) {
    transform: translate(100%, 0);
    -webkit-animation: box1 var(--duration) linear infinite;
    animation: box1 var(--duration) linear infinite;
  }

  .boxes .box:nth-child(2) {
    transform: translate(0, 100%);
    -webkit-animation: box2 var(--duration) linear infinite;
    animation: box2 var(--duration) linear infinite;
  }

  .boxes .box:nth-child(3) {
    transform: translate(100%, 100%);
    -webkit-animation: box3 var(--duration) linear infinite;
    animation: box3 var(--duration) linear infinite;
  }

  .boxes .box:nth-child(4) {
    transform: translate(200%, 0);
    -webkit-animation: box4 var(--duration) linear infinite;
    animation: box4 var(--duration) linear infinite;
  }

  .boxes .box > div {
    --background: #4ade80; /* green base */
    --top: auto;
    --right: auto;
    --bottom: auto;
    --left: auto;
    --translateZ: calc(var(--size) / 2);
    --rotateY: 0deg;
    --rotateX: 0deg;
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--background);
    top: var(--top);
    right: var(--right);
    bottom: var(--bottom);
    left: var(--left);
    transform: rotateY(var(--rotateY)) rotateX(var(--rotateX)) translateZ(var(--translateZ));
  }

  .boxes .box > div:nth-child(1) {
    --top: 0;
    --left: 0;
  }

  .boxes .box > div:nth-child(2) {
    --background: #bef264; /* yellow-green */
    --right: 0;
    --rotateY: 90deg;
  }

  .boxes .box > div:nth-child(3) {
    --background: #22c55e; /* green accent */
    --rotateX: -90deg;
  }

  .boxes .box > div:nth-child(4) {
    --background: #ecfccb; /* pale yellow */
    --top: 0;
    --left: 0;
    --translateZ: calc(var(--size) * 3 * -1);
  }

  /* Animations remain unchanged */
  @-webkit-keyframes box1 { 0%, 50% { transform: translate(100%, 0); } 100% { transform: translate(200%, 0); } }
  @keyframes box1 { 0%, 50% { transform: translate(100%, 0); } 100% { transform: translate(200%, 0); } }

  @-webkit-keyframes box2 { 0% { transform: translate(0, 100%); } 50% { transform: translate(0, 0); } 100% { transform: translate(100%, 0); } }
  @keyframes box2 { 0% { transform: translate(0, 100%); } 50% { transform: translate(0, 0); } 100% { transform: translate(100%, 0); } }

  @-webkit-keyframes box3 { 0%, 50% { transform: translate(100%, 100%); } 100% { transform: translate(0, 100%); } }
  @keyframes box3 { 0%, 50% { transform: translate(100%, 100%); } 100% { transform: translate(0, 100%); } }

  @-webkit-keyframes box4 { 0% { transform: translate(200%, 0); } 50% { transform: translate(200%, 100%); } 100% { transform: translate(100%, 100%); } }
  @keyframes box4 { 0% { transform: translate(200%, 0); } 50% { transform: translate(200%, 100%); } 100% { transform: translate(100%, 100%); } }
`;

export default Loader;
