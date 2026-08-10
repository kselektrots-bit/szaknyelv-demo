if (mode === 'listening' && displayItem) {
  // Csak 10 feladatot ajánl fel körönként
  const maxTasksPerRound = 10
  const roundItems = errorMode 
    ? filteredItems.slice(0, maxTasksPerRound)
    : items.slice(0, maxTasksPerRound)
  
  const listeningOptions = currentListeningOptions.length > 0 
    ? currentListeningOptions 
    : generateListeningOptions(displayItem)
  
  if (currentListeningOptions.length === 0) {
    setCurrentListeningOptions(listeningOptions)
  }

  return (
    <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh' }}>
      <h2>🔊 Hallgatás</h2>
      <div style={{ textAlign: 'center', marginBottom: '20px', color: '#8A8D96' }}>
        {idx + 1} / {Math.min(roundItems.length, maxTasksPerRound)} | Pont: {score}
      </div>
      <div style={{ background: '#25272E', padding: '40px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '2px solid #FF6B35' }}>
        <button 
          onClick={() => {
            const utterance = new SpeechSynthesisUtterance(getText(displayItem))
            utterance.lang = lang === 'en' ? 'en-US' : 'de-DE'
            utterance.rate = 0.8
            speechSynthesis.speak(utterance)
          }} 
          style={{ padding: '20px 40px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>
          🔊 HALLGATÁS
        </button>
        <p style={{ color: '#8A8D96', marginTop: '20px' }}>Válasszd ki a helyes választ!</p>
      </div>
      <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
        {listeningOptions.map((opt, i) => (
          <button key={i} onClick={() => { if (opt.id === displayItem.id) { setShowResult(true); bump(displayItem.id, true); setScore(score + 1); setSessionScore(sessionScore + 1) } else { bump(displayItem.id, false); setShowResult(true) }; setSelected(i) }} disabled={showResult} style={{ padding: '15px', background: showResult && i === selected ? (opt.id === displayItem.id ? '#4CAF7D' : '#E05B4E') : '#333', color: '#fff', border: '2px solid #FF6B35', borderRadius: '8px', cursor: showResult ? 'default' : 'pointer', fontWeight: 'bold' }}>
            {opt.hu}
          </button>
        ))}
      </div>
      {showResult && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: selected !== null && listeningOptions[selected].id === displayItem.id ? '#4CAF7D' : '#E05B4E', padding: '15px', background: selected !== null && listeningOptions[selected].id === displayItem.id ? 'rgba(76, 175, 125, 0.2)' : 'rgba(224, 91, 78, 0.2)', borderRadius: '8px' }}>
            {selected !== null && listeningOptions[selected].id === displayItem.id ? '✅ JÓ!' : '❌ ROSSZ!'}
          </div>
          <button onClick={() => { if (idx + 1 < maxTasksPerRound && idx + 1 < roundItems.length) { setIdx(idx + 1); setShowResult(false); setSelected(null); setCurrentListeningOptions([]) } else { setMode(null); setIdx(0); setCurrentListeningOptions([]) } }} style={{ padding: '15px', width: '100%', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px' }}>
            {idx + 1 >= maxTasksPerRound ? '✅ Kör vége!' : '→ Következő'}
          </button>
        </>
      )}
      <button onClick={() => { setMode(null); setIdx(0); setCurrentListeningOptions([]) }} style={{ padding: '12px', width: '100%', background: '#666', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
        ← Vissza
      </button>
    </div>
  )
}