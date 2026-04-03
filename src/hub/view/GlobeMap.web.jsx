import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../../shared/theme';

const LEAFLET_VERSION = require('leaflet/package.json').version;

/** Web fallback: Leaflet inside an iframe (react-native-maps is native-only). */
function buildHtml(markers, line) {
  const data = JSON.stringify({
    markers,
    line,
    colors: {
      primary: Colors.primary,
      secondary: Colors.secondary,
      stroke: Colors.primary,
    },
  });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@${LEAFLET_VERSION}/dist/leaflet.css"/>
<script src="https://cdn.jsdelivr.net/npm/leaflet@${LEAFLET_VERSION}/dist/leaflet.js"><\/script>
<style>
html,body,#map{height:100%;width:100%;margin:0;background:${Colors.background};}
.leaflet-container{background:${Colors.background}!important;font-family:system-ui,sans-serif;}
.leaflet-tile-pane{filter:brightness(0.58) contrast(1.14) saturate(1.28) hue-rotate(-14deg);}
.leaflet-control-attribution{
 margin:0!important;background:rgba(10,14,26,.82)!important;color:${Colors.textTertiary}!important;
 font-size:8px!important;line-height:1.2!important;padding:3px 8px!important;border-radius:0 8px 0 0!important;
 max-width:85%;
}
.leaflet-control-attribution a{color:${Colors.textSecondary}!important;}
.hub-marker-lbl{
 background:rgba(10,14,26,.9)!important;border:1px solid ${Colors.borderMedium}!important;
 border-radius:8px!important;padding:3px 9px!important;margin:0!important;
 color:${Colors.textPrimary}!important;font-size:11px!important;font-weight:600!important;
 box-shadow:0 2px 8px rgba(0,0,0,.35)!important;white-space:nowrap!important;
}
.hub-marker-lbl:before{display:none!important;}
.hub-marker-lbl.hub-marker-lbl--active{
 border-color:${Colors.secondary}!important;color:${Colors.secondary}!important;
}
.leaflet-popup-content-wrapper,.leaflet-popup-tip{display:none!important;}
</style>
</head><body><div id="map"></div>
<script>(function(){
var data=${data};
var map=L.map('map',{
 zoomSnap:0.25,zoomDelta:0.5,zoomControl:false,attributionControl:true,
 minZoom:2,maxZoom:22,maxBounds:[[-75,-185],[78,185]],worldCopyJump:true
});
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
 maxZoom:22,maxNativeZoom:19,subdomains:'abcd',
 attribution:'\\u00a9 OpenStreetMap \\u00a9 CARTO'
}).addTo(map);
[-66.5,-23.436,-0.001,23.436,66.5].forEach(function(lat){
 L.polyline([[lat,-178],[lat,178]],{color:'rgba(200,210,230,0.26)',weight:1,dashArray:'4,6',interactive:false}).addTo(map);
});
window.__hubMarkerEntries=[];
var P=data.colors.primary,S=data.colors.secondary;
var group=[];
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
(data.markers||[]).forEach(function(m){
 var c=L.circleMarker([m.lat,m.lng],{radius:10,fillColor:P,color:P,weight:0,opacity:1,fillOpacity:0.96});
 c.on('click',function(){window.parent.postMessage(JSON.stringify({type:'marker',name:m.name}),'*');});
 c.bindTooltip(esc(m.label||m.name||''),{permanent:true,direction:'right',offset:[14,-2],className:'hub-marker-lbl',interactive:false,opacity:1});
 c.addTo(map);group.push(c);window.__hubMarkerEntries.push({name:m.name,layer:c});
});
if(data.line&&data.line.length>=2)
 L.polyline(data.line,{color:data.colors.stroke,weight:3.5,opacity:0.88,lineCap:'round',lineJoin:'round'}).addTo(map);
if(group.length) map.fitBounds(L.featureGroup(group).getBounds().pad(0.14));
else map.setView([16,12],2.35);
window.__setHubSelection=function(sel){
 window.__hubMarkerEntries.forEach(function(x){
  var on=sel&&x.name===sel;var col=on?S:P;
  x.layer.setStyle({fillColor:col,color:col,weight:0,opacity:1,fillOpacity:0.96});
  var el=(x.layer.getTooltip()||{}).getElement&&x.layer.getTooltip().getElement();
  if(el){if(on)el.classList.add('hub-marker-lbl--active');else el.classList.remove('hub-marker-lbl--active');}
 });
};
window.addEventListener('message',function(e){
 try{var d=JSON.parse(e.data);if(d.type==='select')window.__setHubSelection(d.name);}catch{}
});
})();<\/script></body></html>`;
}

export default function GlobeMap({
  locations,
  routeCoords,
  selectedName,
  fitKey,
  onMarkerPress,
}) {
  const iframeRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const onBoxLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width < 1 || height < 1) return;
    setBox((b) =>
      Math.abs(b.w - width) < 1 && Math.abs(b.h - height) < 1
        ? b
        : { w: width, h: height },
    );
  }, []);

  const markers = useMemo(
    () =>
      (locations || []).map((l) => ({
        id: l.id,
        name: l.name,
        label: l.nameEn ?? l.name,
        lat: Number(l.coordinates.latitude),
        lng: Number(l.coordinates.longitude),
      })),
    [locations],
  );

  const line = useMemo(() => {
    if (!routeCoords || routeCoords.length < 2) return [];
    return routeCoords.map((c) => [Number(c.latitude), Number(c.longitude)]);
  }, [routeCoords]);

  const html = useMemo(() => buildHtml(markers, line), [markers, line]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ type: 'select', name: selectedName ?? null }),
        '*',
      );
    } catch { /* cross-origin guard */ }
  }, [selectedName]);

  useEffect(() => {
    function onMsg(e) {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'marker' && msg.name) onMarkerPress?.(msg.name);
      } catch { /* ignore */ }
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [onMarkerPress]);

  return (
    <View style={styles.fill} onLayout={onBoxLayout}>
      {box.w > 0 && box.h > 0 ? (
        <iframe
          ref={iframeRef}
          key={fitKey}
          srcDoc={html}
          style={{
            width: box.w,
            height: box.h,
            border: 'none',
            borderRadius: BorderRadius.lg,
            overflow: 'hidden',
            backgroundColor: Colors.background,
          }}
          sandbox="allow-scripts"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    minHeight: 260,
  },
});
