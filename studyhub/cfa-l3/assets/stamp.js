// Stamps every localStorage write to a cfa3_ key with a timestamp, so sync can resolve conflicts. Loaded on every page.
(function () {
  try {
    const rawSet = Storage.prototype.setItem, rawRemove = Storage.prototype.removeItem, rawGet = Storage.prototype.getItem;
    const skip = /^cfa3_(meta|sync|probe|ui|trk_open|trk_draft|qb_setup|gloss_mode)/;
    window.__rawSet = (k, v) => rawSet.call(localStorage, k, v);
    window.__rawRemove = k => rawRemove.call(localStorage, k);
    window.__syncSkip = skip;
    function stamp(k) {
      if (typeof k !== 'string' || k.indexOf('cfa3_') !== 0 || skip.test(k)) return;
      let m = {}; try { m = JSON.parse(rawGet.call(localStorage, 'cfa3_meta') || '{}'); } catch (e) {}
      m[k] = Date.now(); rawSet.call(localStorage, 'cfa3_meta', JSON.stringify(m));
      try { window.dispatchEvent(new Event('cfa3-change')); } catch (e) {}
    }
    Storage.prototype.setItem = function (k, v) { rawSet.call(this, k, v); if (this === localStorage) stamp(k); };
    Storage.prototype.removeItem = function (k) { rawRemove.call(this, k); if (this === localStorage) stamp(k); };
  } catch (e) {}
})();
