import React from 'react';
import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';

export default function FamilyEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  id,
  data
}: EdgeProps) {
  let path = '';

  const isDivorced = data?.isDivorced;
  const isHub = data?.isHub;
  const isChild = data?.isChild;

  if (isDivorced) {
    // קו ישיר לאלכסונים במקרה של גירושים
    [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  } else if (isHub) {
    // מההורים אל ה-Hub (יוצר את החצי הימני והחצי השמאלי של הגשר האופקי!)
    // הצורה היא "L" יורדת מההורה – פוגשת את ה-Y של ה-HUB – ואז נמתחת אופקית כדי להיסגר.
    // מכיוון שיש לנו 2 הורים שמגיעים לאותה נקודה אופקית, נוצרת צורת ה-|________| המושלמת.
    path = `M ${sourceX} ${sourceY} L ${sourceX} ${targetY} L ${targetX} ${targetY}`;
  } else if (isChild) {
    // מה-Hub אל הילדים (פיצול אופקי מסודר למטה)
    const bridgeY = sourceY + 40; 
    path = `M ${sourceX} ${sourceY} L ${sourceX} ${bridgeY} L ${targetX} ${bridgeY} L ${targetX} ${targetY}`;
  } else {
    // Default fallback
    const bridgeY = (sourceY + targetY) / 2;
    path = `M ${sourceX} ${sourceY} L ${sourceX} ${bridgeY} L ${targetX} ${bridgeY} L ${targetX} ${targetY}`;
  }

  // אסתטיקה לקווים: ריכוך קל בפינות לחיבור יוקרתי (אם מבוקש בעתיד אפשר להוסיף רדיוס, אבל כרגע זוויתי נקי)
  return <BaseEdge id={id} path={path} style={style} />;
}
