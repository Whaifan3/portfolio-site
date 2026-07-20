 import { useState, useCallback } from "react";
 import "./Folder.css";
 
 function darkenColor(hex, percent) {
   let color = hex.startsWith("#") ? hex.slice(1) : hex;
   if (color.length === 3) {
     color = color.split("").map((c) => c + c).join("");
   }
   const num = Number.parseInt(color, 16);
   let r = (num >> 16) & 0xff;
   let g = (num >> 8) & 0xff;
   let b = num & 0xff;
   r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
   g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
   b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
   return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
 }
 
 export default function Folder({
   color = "#2866ff",
   size = 1,
   items = [],
   className = "",
   label = "",
   subLabels = [],
   onOpen,
   panelLabel = "View projects",
 }) {
   const maxItems = 3;
   const papers = items.slice(0, maxItems);
   const displayLabels = [];
   for (let i = 0; i < maxItems; i++) {
     displayLabels[i] = subLabels[i] || "";
   }
 
   const [open, setOpen] = useState(false);
   const [paperOffsets, setPaperOffsets] = useState(
     Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
   );
   const [hovered, setHovered] = useState(false);
 
   const folderBackColor = darkenColor(color, 0.12);
   const paperColors = [
     darkenColor("#ffffff", 0.12),
     darkenColor("#ffffff", 0.06),
     "#ffffff",
   ];
 
   const handleClick = useCallback(() => {
     setOpen((prev) => {
       const next = !prev;
       if (next) {
         setTimeout(() => onOpen?.(), 350);
       }
       if (!next) {
         setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
       }
       return next;
     });
   }, [onOpen]);
 
   const handlePaperMouseMove = useCallback(
     (e, index) => {
       if (!open) return;
       const rect = e.currentTarget.getBoundingClientRect();
       const centerX = rect.left + rect.width / 2;
       const centerY = rect.top + rect.height / 2;
       const offsetX = (e.clientX - centerX) * 0.15;
       const offsetY = (e.clientY - centerY) * 0.15;
       setPaperOffsets((prev) => {
         const next = [...prev];
         next[index] = { x: offsetX, y: offsetY };
         return next;
       });
     },
     [open],
   );
 
   const handlePaperMouseLeave = useCallback((_e, index) => {
     setPaperOffsets((prev) => {
       const next = [...prev];
       next[index] = { x: 0, y: 0 };
       return next;
     });
   }, []);
 
   const folderStyle = {
     "--folder-color": color,
     "--folder-back-color": folderBackColor,
     "--paper-1": paperColors[0],
     "--paper-2": paperColors[1],
     "--paper-3": paperColors[2],
   };
 
   const folderClassName = `folder ${open ? "open" : ""} ${hovered && !open ? "folder-hover" : ""}`.trim();
 
   return (
     <div className={`folder-wrapper ${className}`.trim()} style={{ transform: `scale(${size})` }}>
       <div className="folder-label-row">
         {label && <span className="folder-project-label">{label}</span>}
       </div>
 
       <div
         className={folderClassName}
         style={folderStyle}
         onClick={handleClick}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
         onKeyDown={(e) => {
           if (e.key === "Enter" || e.key === " ") {
             e.preventDefault();
             handleClick();
           }
         }}
         tabIndex={0}
         role="button"
         aria-expanded={open}
         aria-label={open ? "Close folder" : "Open folder"}
       >
         <div className="folder__back">
           {papers.map((_, i) => (
             <div
               key={i}
               className={`paper paper-${i + 1}`}
               onMouseMove={(e) => handlePaperMouseMove(e, i)}
               onMouseLeave={(e) => handlePaperMouseLeave(e, i)}
               style={
                 open
                   ? {
                       "--magnet-x": `${paperOffsets[i]?.x || 0}px`,
                       "--magnet-y": `${paperOffsets[i]?.y || 0}px`,
                     }
                   : {}
               }
             >
               {items[i] || (
                 <span className="paper-label">{displayLabels[i]}</span>
               )}
             </div>
           ))}
           <div className="folder__front">
             <div className="folder-icon">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"/>
               </svg>
             </div>
           </div>
           <div className="folder__front right"></div>
         </div>
       </div>
 
       {!open && (
         <div className="folder-projects-hint">
           <span>{panelLabel}</span>
         </div>
       )}
     </div>
   );
 }
