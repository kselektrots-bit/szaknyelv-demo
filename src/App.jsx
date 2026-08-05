import React, { useState, useEffect } from 'react'
import data from './data.json'

function App() {
  const [screen, setScreen] = useState('language')
  const [lang, setLang] = useState(null)
  const [category, setCategory] = useState('szókincs')
  const [mode, setMode] = useState(null)
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState({})
  const [flipped, setFlipped] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [input, setInput] = useState('')
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [pairs, setPairs] = useState({})
  const [selectedHu, setSelectedHu] = useState(null)
  const [dailyMinutes, setDailyMinutes] = useState(90)
  const [dailyWords, setDailyWords] = useState(20)
  const [errorMode, setErrorMode] = useState(false)
  const [currentQuizOptions, setCurrentQuizOptions] = useState([])
  const [currentListeningOptions, setCurrentListeningOptions] = useState([])
  const [showStats, setShowStats] = useState(false)
  const [sessionScore, setSessionScore] = useState(0)
  const [currentGappedWord, setCurrentGappedWord] = useState(null)
  const [gapInfo, setGapInfo] = useState(null)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installPromptVisible, setInstallPromptVisible] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setInstallPromptVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setInstallPromptVisible(false)
      }
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('progress')
    if (saved) setProgress(JSON.parse(saved))
    const settings = localStorage.getItem('settings')
    if (settings) {
      const s = JSON.parse(settings)
      setDailyMinutes(s.dailyMinutes || 90)
      setDailyWords(s.dailyWords || 20)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('progress', JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({ dailyMinutes, dailyWords }))
  }, [dailyMinutes, dailyWords])

  const getLangName = () => lang === 'en' ? '🇬🇧 English' : '🇩🇪 Deutsch'

  const getItems = () => {
    const items = {
      szókincs: data.szókincs || [],
      mondatok: data.mondatok || [],
      számok: data.számok || []
    }
    return items[category] || []
  }

  const items = getItems()
  const item = items[idx % Math.max(items.length, 1)]

  const getFilteredItems = () => {
    if (!errorMode) return items
    return items.filter(i => {
      const level = progress[i.id]?.level || 0
      return level === 0
    })
  }

  const filteredItems = getFilteredItems()
  const filteredItem = filteredItems[idx % Math.max(filteredItems.length, 1)]
  const displayItem = errorMode ? filteredItem : item

  const bump = (id, correct) => {
    setProgress(prev => ({
      ...prev,
      [id]: {
        level: correct ? Math.min(4, (prev[id]?.level || 0) + 1) : Math.max(0, (prev[id]?.level || 0) - 1),
        lastTried: new Date().toISOString(),
        errors: (prev[id]?.errors || 0) + (correct ? 0 : 1)
      }
    }))
  }

  const speak = (text, language = 'de-DE') => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const getText = (obj) => {
    if (!obj) return ''
    if (lang === 'en') return obj.en || obj.hu
    return obj.de || obj.hu
  }

  const getPhonetic = (obj) => {
    if (!obj) return ''
    return obj.fo || ''
  }

  const generateQuizOptions = (currentItem) => {
    const allItems = items.filter(i => i.id !== currentItem.id)
    const shuffled = allItems.sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [currentItem, ...shuffled].sort(() => Math.random() - 0.5)
    return options
  }

  const generateListeningOptions = (currentItem) => {
    const allItems = items.filter(i => i.id !== currentItem.id)
    const shuffled = allItems.sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [currentItem, ...shuffled].sort(() => Math.random() - 0.5)
    return options
  }

  const generateGappedWord = (targetText) => {
    if (category === 'mondatok') {
      const words = targetText.split(' ')
      const randomWordIdx = Math.floor(Math.random() * words.length)
      const gappedDisplay = words.map((word, idx) => idx === randomWordIdx ? '______' : word).join(' ')
      return { gapped: gappedDisplay, correct: words[randomWordIdx] }
    } else {
      if (targetText.length > 2) {
        const randomPos = Math.floor(Math.random() * (targetText.length - 2))
        const gapLength = Math.min(3, Math.floor(targetText.length / 2))
        const before = targetText.substring(0, randomPos)
        const gap = '_'.repeat(gapLength)
        const after = targetText.substring(randomPos + gapLength)
        return { gapped: before + gap + after, correct: targetText }
      } else {
        return { gapped: targetText, correct: targetText }
      }
    }
  }

  useEffect(() => {
    if (mode === 'fillgap' && displayItem) {
      const targetText = getText(displayItem)
      const gapped = generateGappedWord(targetText)
      setCurrentGappedWord(gapped.gapped)
      setGapInfo(gapped.correct)
    }
  }, [idx, mode, category, errorMode])

  const getStats = () => {
    const allProgress = Object.values(progress).filter(p => p && p.level !== undefined)
    const masteredCount = allProgress.filter(p => p.level >= 3).length
    const learningCount = allProgress.filter(p => p.level === 1 || p.level === 2).length
    const errorCount = allProgress.filter(p => p.level === 0).length
    const totalErrors = allProgress.reduce((sum, p) => sum + (p.errors || 0), 0)
    return { masteredCount, learningCount, errorCount, totalErrors, total: allProgress.length }
  }

  const getBadges = () => {
    const stats = getStats()
    const badges = []
    if (stats.masteredCount >= 10) badges.push({ icon: '🌟', name: 'Kezdő szakember' })
    if (stats.masteredCount >= 30) badges.push({ icon: '⭐', name: 'Profi villanyszerelő' })
    if (stats.masteredCount >= 50) badges.push({ icon: '🏆', name: 'Villanyszerelő Maestro' })
    if (stats.total > 0 && stats.errorCount === 0) badges.push({ icon: '✨', name: 'Hibátlan!' })
    if (sessionScore >= 20) badges.push({ icon: '🔥', name: '20+ pont egy szezónban!' })
    return badges
  }

 if (screen === 'language') {
    return (
      <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>⚡🎓</h1>
        <h1 style={{ marginBottom: '10px' }}>Villanyszerelő Szókincs PRO</h1>
        <p style={{ color: '#8A8D96', marginBottom: '40px', fontSize: '16px' }}>Magyar-Angol-Német szaknyelv tanulás</p>
        
        {installPromptVisible && (
          <div style={{ background: '#25272E', padding: '30px', borderRadius: '12px', marginBottom: '40px', border: '3px solid #4CAF7D' }}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>📱</div>
            <h2 style={{ color: '#4CAF7D', marginBottom: '15px' }}>Telepítsd az alkalmazást!</h2>
            <p style={{ color: '#8A8D96', marginBottom: '20px', fontSize: '14px' }}>Használd offline és gyorsabban!</p>
            <button 
              onClick={handleInstall} 
              style={{ 
                width: '100%',
                padding: '20px', 
                fontSize: '18px', 
                background: '#4CAF7D', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                marginBottom: '10px'
              }}
            >
              ⬇️ TELEPÍTÉS
            </button>
            <button 
              onClick={() => setInstallPromptVisible(false)} 
              style={{ 
                width: '100%',
                padding: '10px', 
                fontSize: '14px', 
                background: '#333', 
                color: '#8A8D96', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer'
              }}
            >
              Később
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gap: '10px' }}>
          <button onClick={() => { setLang('en'); setScreen('settings') }} style={{ padding: '20px', fontSize: '18px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🇬🇧 Learn English
          </button>
          <button onClick={() => { setLang('de'); setScreen('settings') }} style={{ padding: '20px', fontSize: '18px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🇩🇪 Deutsch Lernen
          </button>
        </div>

        <p style={{ color: '#8A8D96', marginTop: '40px', fontSize: '12px' }}>Weboldalat böngészőből: <strong>localhost:5175</strong></p>
      </div>
    )
  }

  if (screen === 'settings') {
    return (
      <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh' }}>
        <h1>⚙️ Tanulási Beállítások</h1>
        <div style={{ background: '#25272E', padding: '30px', borderRadius: '12px', marginBottom: '30px' }}>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
              ⏱️ Napi Tanulási Idő: <span style={{ color: '#FF6B35' }}>{dailyMinutes} perc</span>
            </label>
            <input type="range" min="30" max="180" step="15" value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} style={{ width: '100%', height: '8px', cursor: 'pointer' }} />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
              📚 Szavak/Nap: <span style={{ color: '#FF6B35' }}>{dailyWords} szó</span>
            </label>
            <input type="range" min="5" max="50" step="5" value={dailyWords} onChange={(e) => setDailyWords(Number(e.target.value))} style={{ width: '100%', height: '8px', cursor: 'pointer' }} />
          </div>
          <div style={{ background: '#1C1D21', padding: '20px', borderRadius: '8px', border: '2px solid #FF6B35' }}>
            <h3 style={{ color: '#FF6B35', marginBottom: '15px' }}>📊 TANULÁSI TERV</h3>
            <p>✅ <strong>Naponta:</strong> {dailyMinutes} perc | {dailyWords} szó</p>
            <p>✅ <strong>Hetente:</strong> {dailyMinutes * 7} perc (~{Math.round(dailyMinutes * 7 / 60)} óra)</p>
            <p style={{ color: '#4CAF7D', fontWeight: 'bold', marginTop: '10px' }}>✅ <strong>3 HÓNAPON BELÜL:</strong> {dailyWords * 90} szó | MUNKAHELYKÉSZ!</p>
          </div>
        </div>
        <button onClick={() => setScreen('home')} style={{ padding: '15px', fontSize: '16px', background: '#4CAF7D', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: 'bold', marginBottom: '10px' }}>
          ✅ Kész - Indítás
        </button>
        <button onClick={() => setScreen('language')} style={{ padding: '15px', fontSize: '16px', background: '#666', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
          🌐 Vissza
        </button>
      </div>
    )
  }

  if (screen === 'home') {
    const stats = getStats()
    const badges = getBadges()
    return (
      <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh' }}>
        <h1>🎓 Villanyszerelő {getLangName()}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#25272E', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF7D' }}>{stats.masteredCount}</div>
            <div style={{ fontSize: '12px', color: '#8A8D96' }}>Megtanult</div>
          </div>
          <div style={{ background: '#25272E', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B35' }}>{stats.learningCount}</div>
            <div style={{ fontSize: '12px', color: '#8A8D96' }}>Tanulás alatt</div>
          </div>
          <div style={{ background: '#25272E', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#E05B4E' }}>{stats.errorCount}</div>
            <div style={{ fontSize: '12px', color: '#8A8D96' }}>Hiba</div>
          </div>
        </div>
        {badges.length > 0 && (
          <div style={{ background: '#25272E', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>🏆 Kitüntetések:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
              {badges.map((badge, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: '10px', background: '#1C1D21', borderRadius: '6px' }}>
                  <div style={{ fontSize: '24px' }}>{badge.icon}</div>
                  <div style={{ fontSize: '11px', color: '#8A8D96' }}>{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => { setScreen('learn'); setMode(null); setSelected(null); setShowResult(false); setSessionScore(0) }} style={{ padding: '20px', fontSize: '18px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            📚 Tanulás
          </button>
          <div style={{ background: '#25272E', padding: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>🐛 Hiba Mód</div>
              <div style={{ fontSize: '12px', color: '#8A8D96' }}>Csak hibás szavak</div>
            </div>
            <button onClick={() => setErrorMode(!errorMode)} style={{ padding: '8px 16px', background: errorMode ? '#4CAF7D' : '#666', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {errorMode ? 'BEKAPCS.' : 'KIKAPCS.'}
            </button>
          </div>
          <button onClick={() => setShowStats(!showStats)} style={{ padding: '15px', fontSize: '16px', background: '#666', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            📊 Statisztika
          </button>
          <button onClick={() => setScreen('settings')} style={{ padding: '15px', fontSize: '16px', background: '#666', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            ⚙️ Beállítások
          </button>
          <button onClick={() => { setScreen('language'); setLang(null) }} style={{ padding: '15px', fontSize: '16px', background: '#444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            🌐 Nyelv Váltása
          </button>
        </div>
        {showStats && (
          <div style={{ background: '#25272E', padding: '20px', borderRadius: '8px', border: '2px solid #FF6B35' }}>
            <h3 style={{ color: '#FF6B35', marginBottom: '15px' }}>📈 RÉSZLETES STATISZTIKA</h3>
            <p>📚 <strong>Összes elem:</strong> {stats.total}</p>
            <p>✅ <strong>Megtanult (3+ szint):</strong> {stats.masteredCount}</p>
            <p>🔄 <strong>Tanulás alatt (1-2 szint):</strong> {stats.learningCount}</p>
            <p>❌ <strong>Hibás (0 szint):</strong> {stats.errorCount}</p>
            <p>📊 <strong>Összes hiba:</strong> {stats.totalErrors}</p>
            <p style={{ color: '#4CAF7D', fontWeight: 'bold', marginTop: '10px' }}>🎯 <strong>Haladás:</strong> {Math.round((stats.masteredCount / stats.total) * 100)}%</p>
          </div>
        )}
      </div>
    )
  }

  if (screen === 'learn') {
    if (!mode) {
      return (
        <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh' }}>
          <h2>📚 {errorMode ? '🐛 HIBA MÓD' : 'Kategória Választás'}</h2>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
            {['szókincs', 'mondatok', 'számok'].map(cat => (
              <button key={cat} onClick={() => { setCategory(cat); setIdx(0) }} style={{ padding: '15px', background: category === cat ? '#FF6B35' : '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' }}>
                {cat === 'szókincs' ? '📖' : cat === 'mondatok' ? '💬' : '🔢'} {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <h2>🎮 Játék Módok</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            <button onClick={() => { setMode('cards'); setIdx(0); setFlipped(false) }} style={{ padding: '15px', background: '#25272E', color: '#fff', border: '2px solid #FF6B35', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              📚 Kártyák
            </button>
            <button onClick={() => { setMode('quiz'); setIdx(0); setSelected(null); setShowResult(false); setCurrentQuizOptions([]) }} style={{ padding: '15px', background: '#25272E', color: '#fff', border: '2px solid #FF6B35', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              ❓ Kvíz
            </button>
            <button onClick={() => { setMode('listening'); setIdx(0); setSelected(null); setShowResult(false); setCurrentListeningOptions([]) }} style={{ padding: '15px', background: '#25272E', color: '#fff', border: '2px solid #FF6B35', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              🔊 Hallgatás
            </button>
            <button onClick={() => { setMode('pairing'); setIdx(0); setPairs({}); setSelectedHu(null) }} style={{ padding: '15px', background: '#25272E', color: '#fff', border: '2px solid #FF6B35', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              🎯 Párosítás
            </button>
            <button onClick={() => { setMode('writing'); setIdx(0); setInput(''); setChecked(false) }} style={{ padding: '15px', background: '#25272E', color: '#fff', border: '2px solid #FF6B35', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              ✍️ Gépelés
            </button>
            <button onClick={() => { setMode('fillgap'); setIdx(0); setInput(''); setChecked(false) }} style={{ padding: '15px', background: '#25272E', color: '#fff', border: '2px solid #FF6B35', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              🔤 Szócsonka
            </button>
          </div>
          <button onClick={() => setScreen('home')} style={{ padding: '12px', marginTop: '20px', width: '100%', background: '#666', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
            ← Home
          </button>
        </div>
      )
    }

    if (mode === 'cards' && displayItem) {
      return (
        <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh' }}>
          <h2>📚 Kártyák</h2>
          <div style={{ textAlign: 'center', marginBottom: '20px', color: '#8A8D96' }}>
            {idx + 1} / {filteredItems.length} {errorMode && '(HIBA MÓD)'}
          </div>
          <div onClick={() => { setFlipped(!flipped); if (!flipped) speak(getText(displayItem), lang === 'en' ? 'en-US' : 'de-DE') }} style={{ background: '#25272E', padding: '60px 20px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '3px solid #FF6B35', marginBottom: '20px' }}>
            <div style={{ color: '#8A8D96', marginBottom: '20px' }}>
              {flipped ? `${getLangName()} | 🔊 Kattints a beszédhez` : 'Magyar'}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{flipped ? getText(displayItem) : displayItem.hu}</div>
            {flipped && getPhonetic(displayItem) && <div style={{ fontSize: '14px', color: '#8A8D96', marginTop: '10px' }}>[{getPhonetic(displayItem)}]</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => { bump(displayItem.id, false); setIdx(idx + 1); setFlipped(false) }} style={{ padding: '15px', background: '#E05B4E', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' }}>
              ❌ Nem tudom
            </button>
            <button onClick={() => { bump(displayItem.id, true); setIdx(idx + 1); setFlipped(false) }} style={{ padding: '15px', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' }}>
              ✅ Tudom
            </button>
          </div>
          <button onClick={() => setMode(null)} style={{ padding: '12px', width: '100%', background: '#666', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
            ← Vissza
          </button>
        </div>
      )
    }

    if (mode === 'quiz' && displayItem) {
      const quizOptions = currentQuizOptions.length > 0 ? currentQuizOptions : generateQuizOptions(displayItem)
      if (currentQuizOptions.length === 0) {
        setCurrentQuizOptions(quizOptions)
      }
      const selectedOption = selected !== null ? quizOptions[selected] : null
      const isCorrectAnswer = selectedOption && selectedOption.id === displayItem.id

      return (
        <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh' }}>
          <h2>❓ Kvíz</h2>
          <div style={{ textAlign: 'center', marginBottom: '20px', color: '#8A8D96' }}>
            {idx + 1} / {filteredItems.length} | Pont: {score} {errorMode && '(HIBA MÓD)'}
          </div>
          <div style={{ background: '#25272E', padding: '30px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '2px solid #FF6B35' }}>
            <div style={{ color: '#8A8D96', marginBottom: '10px' }}>Mi a magyar fordítása?</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>{getText(displayItem)}</div>
            {getPhonetic(displayItem) && <div style={{ fontSize: '14px', color: '#8A8D96', marginBottom: '15px' }}>[{getPhonetic(displayItem)}]</div>}
            <button onClick={() => speak(getText(displayItem), lang === 'en' ? 'en-US' : 'de-DE')} style={{ padding: '10px 20px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              🔊 Ismét
            </button>
          </div>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
            {quizOptions.map((opt, i) => {
              const isSelected = selected === i
              return (
                <button key={i} onClick={() => { if (!showResult) setSelected(i) }} disabled={showResult} style={{ padding: '15px', background: isSelected ? '#FF6B35' : '#333', color: '#fff', border: '2px solid ' + (isSelected ? '#FF6B35' : '#666'), borderRadius: '8px', cursor: showResult ? 'default' : 'pointer', fontWeight: 'bold', opacity: showResult ? 1 : 0.8 }}>
                  {isSelected ? '✓' : '☐'} {opt.hu}
                </button>
              )
            })}
          </div>
          {!showResult && selected !== null && (
            <button onClick={() => { setShowResult(true); if (isCorrectAnswer) { bump(displayItem.id, true); setScore(score + 1); setSessionScore(sessionScore + 1) } else { bump(displayItem.id, false) } }} style={{ padding: '15px', width: '100%', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>
              Ellenőrzés
            </button>
          )}
          {showResult && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: isCorrectAnswer ? '#4CAF7D' : '#E05B4E', padding: '15px', background: isCorrectAnswer ? 'rgba(76, 175, 125, 0.2)' : 'rgba(224, 91, 78, 0.2)', borderRadius: '8px', border: '2px solid ' + (isCorrectAnswer ? '#4CAF7D' : '#E05B4E') }}>
                {isCorrectAnswer ? '✅ JÓ!' : '❌ ROSSZ!'}
              </div>
              {!isCorrectAnswer && (
                <div style={{ textAlign: 'center', marginBottom: '20px', background: '#333', padding: '15px', borderRadius: '8px', color: '#8A8D96' }}>
                  Helyes válasz: <strong style={{ color: '#4CAF7D' }}>{displayItem.hu}</strong>
                </div>
              )}
              <button onClick={() => { setIdx(idx + 1); setShowResult(false); setSelected(null); setCurrentQuizOptions([]) }} style={{ padding: '15px', width: '100%', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px' }}>
                → Következő
              </button>
            </>
          )}
          <button onClick={() => { setMode(null); setCurrentQuizOptions([]); setIdx(0) }} style={{ padding: '12px', width: '100%', background: '#666', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
            ← Vissza
          </button>
        </div>
      )
    }

    if (mode === 'listening' && displayItem) {
      const listeningOptions = currentListeningOptions.length > 0 ? currentListeningOptions : generateListeningOptions(displayItem)
      if (currentListeningOptions.length === 0) {
        setCurrentListeningOptions(listeningOptions)
      }

      return (
        <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh' }}>
          <h2>🔊 Hallgatás</h2>
          <div style={{ textAlign: 'center', marginBottom: '20px', color: '#8A8D96' }}>
            {idx + 1} / {filteredItems.length} | Pont: {score}
          </div>
          <div style={{ background: '#25272E', padding: '40px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '2px solid #FF6B35' }}>
            <button onClick={() => speak(getText(displayItem), lang === 'en' ? 'en-US' : 'de-DE')} style={{ padding: '20px 40px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>
              🔊 MEGHALLGATÁS
            </button>
            <p style={{ color: '#8A8D96', marginTop: '20px' }}>Válassd ki a helyes választ!</p>
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
              <button onClick={() => { setIdx(idx + 1); setShowResult(false); setSelected(null); setCurrentListeningOptions([]) }} style={{ padding: '15px', width: '100%', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px' }}>
                → Következő
              </button>
            </>
          )}
          <button onClick={() => { setMode(null); setIdx(0); setCurrentListeningOptions([]) }} style={{ padding: '12px', width: '100%', background: '#666', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
            ← Vissza
          </button>
        </div>
      )
    }

    if (mode === 'pairing') {
      const pairingItems = filteredItems.slice(0, 10)
      const getShuffled = () => {
        const seed = pairingItems.map(i => i.id).join(',')
        const seededRandom = (index) => {
          const x = Math.sin(index * seed.length) * 10000
          return x - Math.floor(x)
        }
        return pairingItems.slice().sort((a, b) => seededRandom(a.id) - seededRandom(b.id))
      }
      const shuffled = getShuffled()

      return (
        <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh' }}>
          <h2>🎯 Párosítás</h2>
          <p style={{ color: '#8A8D96', marginBottom: '20px' }}>Párosítsd a szavakat! ({Object.keys(pairs).length} / {pairingItems.length}) {errorMode && '(HIBA MÓD)'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <div style={{ color: '#FF6B35', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>Magyar</div>
              {pairingItems.map(item => (
                <button key={item.id} onClick={() => { if (!pairs[item.id]) setSelectedHu(selectedHu === item.id ? null : item.id) }} disabled={pairs[item.id]} style={{ display: 'block', width: '100%', padding: '12px', margin: '5px 0', background: pairs[item.id] ? '#4CAF7D' : selectedHu === item.id ? '#FF6B35' : '#333', color: '#fff', border: selectedHu === item.id ? '2px solid #FF6B35' : '1px solid #666', cursor: pairs[item.id] ? 'default' : 'pointer', borderRadius: '6px', fontWeight: 'bold', opacity: pairs[item.id] ? 0.5 : 1 }}>
                  {pairs[item.id] ? '✅' : ''} {item.hu}
                </button>
              ))}
            </div>
            <div>
              <div style={{ color: '#FF6B35', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>{getLangName()}</div>
              {shuffled.map((target) => (
                <button key={target.id} onClick={() => { if (selectedHu) { if (selectedHu === target.id) { bump(target.id, true); setPairs({ ...pairs, [target.id]: true }); setSelectedHu(null); setScore(score + 1); setSessionScore(sessionScore + 1) } else { bump(target.id, false); setSelectedHu(null) } } }} disabled={pairs[target.id] || !selectedHu} style={{ display: 'block', width: '100%', padding: '12px', margin: '5px 0', background: pairs[target.id] ? '#4CAF7D' : '#333', color: '#fff', border: '1px solid #666', cursor: pairs[target.id] || !selectedHu ? 'default' : 'pointer', borderRadius: '6px', fontWeight: 'bold', opacity: pairs[target.id] ? 0.5 : !selectedHu ? 0.5 : 1 }}>
                  {pairs[target.id] ? '✅' : ''} {getText(target)}
                </button>
              ))}
            </div>
          </div>
          {Object.keys(pairs).length === pairingItems.length && (
            <div style={{ background: '#4CAF7D', color: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
              ✅ Gratulálunk! Összes párosítva!
            </div>
          )}
          <button onClick={() => { setMode(null); setPairs({}); setSelectedHu(null); setIdx(0) }} style={{ padding: '12px', width: '100%', background: '#666', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
            ← Vissza
          </button>
        </div>
      )
    }

    if (mode === 'writing' && displayItem) {
      const handleCheck = () => {
        const isCorrect = input.toLowerCase().trim() === getText(displayItem).toLowerCase()
        setCorrect(isCorrect)
        setChecked(true)
        if (isCorrect) {
          bump(displayItem.id, true)
          setScore(score + 1)
          setSessionScore(sessionScore + 1)
        } else {
          bump(displayItem.id, false)
        }
      }

      return (
        <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh' }}>
          <h2>✍️ Gépelés</h2>
          <div style={{ textAlign: 'center', marginBottom: '20px', color: '#8A8D96' }}>
            {idx + 1} / {filteredItems.length} | Pont: {score} {errorMode && '(HIBA MÓD)'}
          </div>
          <div style={{ background: '#25272E', padding: '30px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '2px solid #FF6B35' }}>
            <div style={{ color: '#8A8D96', marginBottom: '10px' }}>Írd be {getLangName()}-on:</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>{displayItem.hu}</div>
            <button onClick={() => speak(getText(displayItem), lang === 'en' ? 'en-US' : 'de-DE')} style={{ padding: '10px 20px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              🔊 Hallgasd meg
            </button>
          </div>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !checked && handleCheck()} placeholder={`Írd be ${getLangName()}-on...`} autoFocus style={{ width: '100%', padding: '15px', marginBottom: '20px', background: '#333', color: '#fff', border: '2px solid #FF6B35', borderRadius: '8px', fontSize: '16px' }} />
          {!checked ? (
            <button onClick={handleCheck} style={{ padding: '15px', width: '100%', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
              Ellenőrzés
            </button>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold', color: correct ? '#4CAF7D' : '#E05B4E', padding: '15px', background: correct ? 'rgba(76, 175, 125, 0.2)' : 'rgba(224, 91, 78, 0.2)', borderRadius: '8px', border: '2px solid ' + (correct ? '#4CAF7D' : '#E05B4E') }}>
                {correct ? '✅ JÓ!' : '❌ ROSSZ!'}
              </div>
              {!correct && (
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#8A8D96', background: '#333', padding: '15px', borderRadius: '8px' }}>
                  Helyes: <strong style={{ color: '#4CAF7D' }}>{getText(displayItem)}</strong>
                </p>
              )}
              <button onClick={() => { setIdx(idx + 1); setInput(''); setChecked(false) }} style={{ padding: '15px', width: '100%', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' }}>
                → Következő
              </button>
            </>
          )}
          <button onClick={() => { setMode(null); setInput(''); setChecked(false); setIdx(0) }} style={{ padding: '12px', marginTop: '10px', width: '100%', background: '#666', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
            ← Vissza
          </button>
        </div>
      )
    }

    if (mode === 'fillgap' && displayItem && currentGappedWord && gapInfo) {
      const handleCheck = () => {
        const isCorrect = input.toLowerCase().trim() === gapInfo.toLowerCase()
        setCorrect(isCorrect)
        setChecked(true)
        if (isCorrect) {
          bump(displayItem.id, true)
          setScore(score + 1)
          setSessionScore(sessionScore + 1)
        } else {
          bump(displayItem.id, false)
        }
      }

      return (
        <div style={{ padding: '20px', background: '#1C1D21', color: '#fff', minHeight: '100vh' }}>
          <h2>🔤 Szócsonka</h2>
          <div style={{ textAlign: 'center', marginBottom: '20px', color: '#8A8D96' }}>
            {idx + 1} / {filteredItems.length} | Pont: {score}
          </div>
          <div style={{ background: '#25272E', padding: '30px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '2px solid #FF6B35' }}>
            <div style={{ color: '#8A8D96', marginBottom: '15px' }}>
              {category === 'mondatok' ? 'Egészítsd ki a mondatot!' : 'Egészítsd ki a szót!'}
            </div>
            <div style={{ fontSize: category === 'mondatok' ? '18px' : '28px', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '3px', color: '#FF6B35' }}>
              {currentGappedWord}
            </div>
            <div style={{ fontSize: '16px', color: '#8A8D96', marginBottom: '15px' }}>
              {category === 'mondatok' ? 'Mondat: ' : 'Fordítás: '}<strong>{displayItem.hu}</strong>
            </div>
            <button onClick={() => speak(getText(displayItem), lang === 'en' ? 'en-US' : 'de-DE')} style={{ padding: '10px 20px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              🔊 Hallgasd meg
            </button>
          </div>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !checked && handleCheck()} placeholder={category === 'mondatok' ? 'Írd be a hiányzó szót...' : 'Írd be a teljes szót...'} autoFocus style={{ width: '100%', padding: '15px', marginBottom: '20px', background: '#333', color: '#fff', border: '2px solid #FF6B35', borderRadius: '8px', fontSize: '16px' }} />
          {!checked ? (
            <button onClick={handleCheck} style={{ padding: '15px', width: '100%', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
              Ellenőrzés
            </button>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold', color: correct ? '#4CAF7D' : '#E05B4E', padding: '15px', background: correct ? 'rgba(76, 175, 125, 0.2)' : 'rgba(224, 91, 78, 0.2)', borderRadius: '8px', border: '2px solid ' + (correct ? '#4CAF7D' : '#E05B4E') }}>
                {correct ? '✅ JÓ!' : '❌ ROSSZ!'}
              </div>
              {!correct && (
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#8A8D96', background: '#333', padding: '15px', borderRadius: '8px' }}>
                  Helyes: <strong style={{ color: '#4CAF7D' }}>{gapInfo}</strong>
                </p>
              )}
              <button onClick={() => { setIdx(idx + 1); setInput(''); setChecked(false) }} style={{ padding: '15px', width: '100%', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' }}>
                → Következő
              </button>
            </>
          )}
          <button onClick={() => { setMode(null); setInput(''); setChecked(false); setIdx(0) }} style={{ padding: '12px', marginTop: '10px', width: '100%', background: '#666', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
            ← Vissza
          </button>
        </div>
      )
    }
  }

  return null
}

export default App