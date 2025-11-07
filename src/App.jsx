import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// GSAPプラグイン登録
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function BestieWebsite() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [showHero, setShowHero] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showService, setShowService] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [dropLinePosition, setDropLinePosition] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isInServiceSection, setIsInServiceSection] = useState(false);
  const [backgroundWave, setBackgroundWave] = useState(0);
  const [showProfile, setShowProfile] = useState(false); // プロフィールポップアップ状態
  const [showContact, setShowContact] = useState(false); // コンタクトポップアップ状態
  const [isContactClosing, setIsContactClosing] = useState(false); // コンタクトポップアップ閉じるアニメーション状態
  const [isProfileClosing, setIsProfileClosing] = useState(false); // プロフィールポップアップ閉じるアニメーション状態
  const [isMenuOpen, setIsMenuOpen] = useState(false); // ハンバーガーメニュー状態
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight); // 実際のビューポート高さ
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth); // 実際のビューポート幅
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1366); // デスクトップ判定（1366px以上=タブレット横含めモバイルはScrollTrigger使用）

  const isScrolling = useRef(false);
  const lastWheelTime = useRef(0);
  
  // グラデーションアニメーション用のstate
  const [gradientAnimations, setGradientAnimations] = useState({
    bottom: { coordX: 0, coordY: 0, offset1: 0, offset2: 0, offset3: 0, offset4: 0, offset5: 0,
              offset6: 0, offset7: 0, offset8: 0 }, // ← 追加
    top: { coordX: 0, coordY: 0, offset1: 0, offset2: 0, offset3: 0, offset4: 0, offset5: 0 },
    sankaku: { coordX: 0, coordY: 0, offset1: 0, offset2: 0, offset3: 0, offset4: 0, offset5: 0 }
  });
  
  // グラデーションアニメーション設定（簡単にオン/オフ可能）
  const GRADIENT_CONFIG = {
    useCoordAnimation: true,    // 座標アニメーション（方法A）
    useOffsetAnimation: true,   // offsetアニメーション（方法B）
    coordIntensity: 1.0,        // 座標アニメの強さ（0.0で無効、1.0で100%）
    offsetIntensity: 1.0,       // offsetアニメの強さ（0.0で無効、1.0で100%）
  };
  
    // ビューポート高さと幅を更新（モバイルブラウザのアドレスバー対応）
  useEffect(() => {
    let lastWidth = window.innerWidth;
    let resizeTimeout = null;
    
    const updateViewportDimensions = () => {
      // デバウンス処理をクリア
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // 幅が変わった場合のみ高さを更新（オリエンテーション変更や実際のリサイズ）
        // アドレスバーの表示/非表示による高さのみの変化は無視
        if (Math.abs(width - lastWidth) > 10) {
          setViewportHeight(height);
          setViewportWidth(width);
          setIsDesktop(width > 1366); // 1366px以上をデスクトップと判定
          lastWidth = width;
          console.log(`📱 [Viewport] 更新: ${width}x${height}px (デスクトップ: ${width > 1366})`);
        } else {
          // 幅が変わっていない場合は幅とデスクトップ判定のみ更新
          setViewportWidth(width);
          setIsDesktop(width > 1366);
        }
      }, 150); // 150msのデバウンス（アドレスバー変動を無視）
    };
    
    // 初回設定
    updateViewportDimensions();
    
    // リサイズとオリエンテーション変更時に更新
    window.addEventListener('resize', updateViewportDimensions);
    window.addEventListener('orientationchange', updateViewportDimensions);
    
    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener('resize', updateViewportDimensions);
      window.removeEventListener('orientationchange', updateViewportDimensions);
    };
  }, []);
  
  // コンタクトフォームの状態管理
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const serviceRef = useRef(null);
  const companyRef = useRef(null);
  
  const sections = [heroRef, aboutRef, serviceRef, companyRef];
  const totalSections = sections.length;

  const services = [
    {
      title: '組織づくりコンサルティング',
      lines: [
        '現場にはいりこみ、一人ひとりの力に光を当てながら、',
        '関係性の良い組織を育てます。', 
        '「人の良さが自然に生きる場」を作るのが私たちの役割です。'
      ]
    },
    {
      title: 'マネージャ育成支援',
      lines: [
        'マネジメント層が持つ課題に寄り添い、', 
        '実践的なスキルと視座を高めます。', 
        '個々のリーダーシップを引き出し、チーム全体の成長を促進します。'
      ]
    },
    {
      title: '経営者の思いと戦略をつなぐ伴走',
      lines: [
        '経営者のビジョンを組織全体に浸透させ、',
        '戦略を実行可能な形に落とし込みます。', 
        '継続的な支援で、確実な成果へと導きます。'
      ]
    }
  ];

  // フォーム入力ハンドラー
  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  // コンタクトポップアップを優しく閉じるハンドラー
  const handleCloseContact = () => {
    setIsContactClosing(true);
    setTimeout(() => {
      setShowContact(false);
      setIsContactClosing(false);
    }, 500); // 500msのフェードアウトアニメーション
  };

  // プロフィールポップアップを優しく閉じるハンドラー
  const handleCloseProfile = () => {
    setIsProfileClosing(true);
    setTimeout(() => {
      setShowProfile(false);
      setIsProfileClosing(false);
    }, 500); // 500msのフェードアウトアニメーション
  };

  // メール送信ハンドラー
  const handleSendEmail = () => {
    const { name, email, subject, message } = contactForm;
    
    // mailto:リンクを構築
    const mailtoLink = `mailto:App.js_line149info@bestie.co.jp?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `氏名: ${name}\nメールアドレス: ${email}\n\n${message}`
    )}`;
    
    // メールクライアントを開く
    window.location.href = mailtoLink;
  };

  // FullPage.js style scroll control with Service section handling
  // デスクトップのみで動作（モバイル/タブレットは通常スクロール）
  useEffect(() => {
    const handleWheel = (e) => {
      // モバイル/タブレットではこの処理をスキップ（通常スクロールを使用）
      if (!isDesktop) {
        return;
      }
      
      // スクロール中は完全にブロック
      if (isScrolling.current) {
        e.preventDefault();
        return;
      }
      
      const now = Date.now();
      // デバウンス時間を800msに延長（ガタつき防止）
      if (now - lastWheelTime.current < 800) {
        e.preventDefault();
        return;
      }
      
      e.preventDefault();
      
      const delta = e.deltaY;
      
      // Our Serviceセクション内での特別処理（デスクトップ）
      if (currentSection === 2) { // Our Serviceセクション（index = 2）
        // 下スクロール：1/3 → 2/3 → 3/3 → 次のセクションへ
        if (delta > 0) {
          if (serviceIndex < 2) {
            // まだ3/3に達していない → serviceIndexを進める
            setServiceIndex(prev => prev + 1);
            lastWheelTime.current = now;
            console.log(`🔄 [Desktop Wheel] serviceIndex: ${serviceIndex} → ${serviceIndex + 1}`);
            return; // セクション移動はしない
          }
          // serviceIndex === 2（3/3）の場合は、次のセクションへ移動（下記の通常処理へ）
        }
        // 上スクロール：3/3 → 2/3 → 1/3 → 前のセクションへ
        else if (delta < 0) {
          if (serviceIndex > 0) {
            // まだ1/3に達していない → serviceIndexを戻す
            setServiceIndex(prev => prev - 1);
            lastWheelTime.current = now;
            console.log(`🔄 [Desktop Wheel] serviceIndex: ${serviceIndex} → ${serviceIndex - 1}`);
            return; // セクション移動はしない
          }
          // serviceIndex === 0（1/3）の場合は、前のセクションへ移動（下記の通常処理へ）
        }
      }
      
      // 通常のセクション間移動（Our Serviceセクション以外、またはOur Serviceの端に達した場合）
      let nextSection = currentSection;
      
      if (delta > 0 && currentSection < totalSections - 1) {
        nextSection = currentSection + 1;
        // 次のセクションがOur Serviceの場合、1/3から開始
        if (nextSection === 2) {
          setServiceIndex(0);
          console.log(`🎯 [Desktop Wheel] Our Serviceセクションに上から入ります → 1/3に設定`);
        }
      } else if (delta < 0 && currentSection > 0) {
        nextSection = currentSection - 1;
        // 前のセクションがOur Serviceの場合、3/3から開始
        if (nextSection === 2) {
          setServiceIndex(2);
          console.log(`🎯 [Desktop Wheel] Our Serviceセクションに下から入ります → 3/3に設定`);
        }
        // Heroセクション（トップページ）に戻る場合、serviceIndexを1/3にリセット
        else if (nextSection === 0) {
          setServiceIndex(0);
          console.log(`🔄 [Desktop Wheel] Heroセクションに戻ります → serviceIndexを1/3にリセット`);
        }
      }
      
      if (nextSection !== currentSection) {
        isScrolling.current = true;
        setCurrentSection(nextSection);
        lastWheelTime.current = now;
        
        const targetRef = sections[nextSection];
        if (targetRef.current) {
          const targetPosition = targetRef.current.offsetTop;
          const startPosition = window.scrollY;
          const distance = targetPosition - startPosition;
          const duration = 1200;
          let startTime = null;
          
          const easeInOutCubic = (t) => {
            return t < 0.5
              ? 4 * t * t * t
              : 1 - Math.pow(-2 * t + 2, 3) / 2;
          };
          
          const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + distance * ease);
            
            if (progress < 1) {
              requestAnimationFrame(animation);
            } else {
              isScrolling.current = false;
            }
          };
          
          requestAnimationFrame(animation);
        }
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSection, totalSections, sections, serviceIndex, isDesktop]);

  // Scroll handling for animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(progress);

      if (scrollTop > 100) setShowHero(true);

      if (aboutRef.current) {
        const aboutTop = aboutRef.current.offsetTop;
        if (scrollTop > aboutTop - window.innerHeight * 0.5) {
          setShowAbout(true);
        }
      }

      if (serviceRef.current && aboutRef.current) {
        const serviceTop = serviceRef.current.offsetTop;
        const aboutTop = aboutRef.current.offsetTop;
        const aboutHeight = aboutRef.current.offsetHeight;
        // Aboutセクションの中間地点を超えた後にのみServiceの判定を行う
        // これにより、スクロール開始直後の誤発火を防ぐ
        if (scrollTop > aboutTop + aboutHeight * 0.5 && scrollTop > serviceTop - window.innerHeight * 0.5) {
          setShowService(true);
        }
      }

      if (companyRef.current) {
        const companyTop = companyRef.current.offsetTop;
        const companyBottom = companyTop + companyRef.current.offsetHeight;
        // Companyセクション内にいる場合はtrue、それ以外はfalse
        if (scrollTop + window.innerHeight * 0.5 > companyTop && scrollTop < companyBottom) {
          setShowCompany(true);
        } else {
          setShowCompany(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // handleScroll(); ← 初回実行を削除（ユーザーが実際にスクロールした時だけ判定）
    setTimeout(() => setShowHero(true), 300);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // === GSAP ScrollTrigger for Mobile/Tablet Our Service Section ONLY ===
  // モバイル/タブレットのみでOur Serviceセクションのスクロール連動を実装
  // デスクトップは144行目のホイールイベント処理で制御
 useEffect(() => {
    console.log(`🔍 [GSAP ScrollTrigger] 初期化開始 - isDesktop: ${isDesktop}, viewportWidth: ${viewportWidth}px`);
    
    // デスクトップの場合は何もしない（ホイールイベント処理で制御）
    if (isDesktop) {
      console.log(`⏭️ [GSAP ScrollTrigger] デスクトップ(>1366px)のためスキップ（ホイールイベントで制御）`);
      return;
    }
    
    // serviceRef.currentが存在しない場合は何もしない
    if (!serviceRef.current) {
      console.log(`⚠️ [GSAP ScrollTrigger] serviceRef.currentが存在しないためスキップ`);
      return;
    }

    console.log(`🚀 [GSAP ScrollTrigger] タブレット/モバイル(≤1366px)でScrollTrigger作成開始`);

    // 画面向きとデバイスタイプの判定
    const isPortrait = viewportHeight > viewportWidth; // 縦向き判定
    const isTablet = viewportWidth >= 768 && viewportWidth <= 1366; // タブレット判定
    const isTabletLandscape = isTablet && !isPortrait; // タブレット横向き判定
    
    // Our Service 内の仮想スペース数値設定
    const scrollDistance = isPortrait ? viewportHeight * 4 : viewportHeight * 2; // 縦:40倍、横:20倍
    
    // start位置をデバイス・向きに応じて調整
    let startPosition;
    
    if (isTabletLandscape) {
      // タブレット横表示
      startPosition = 'top top+=0px';
    } else if (isTablet && isPortrait) {
      // タブレット縦表示
      startPosition = 'top top+=200px';
    } else {
      // モバイル縦表示
      startPosition = 'top top+=20px';
    }
    console.log(`📐 [GSAP ScrollTrigger] デバイス: ${isTablet ? 'タブレット' : 'モバイル'}, 画面向き: ${isPortrait ? '縦' : '横'}, start位置: ${startPosition}, スクロール距離: ${scrollDistance}px (viewportHeight: ${viewportHeight}px)`);

    // モバイル/タブレット: pinありで固定表示
    const scrollTriggerConfig = {
      trigger: serviceRef.current,
      start: startPosition, // デバイス・向きに応じた位置
      end: `+=${scrollDistance}px`, // ピクセル単位で指定（vh依存を排除）
      pin: true,
      pinSpacing: true,
      scrub: true,
      invalidateOnRefresh: true, // refresh時に位置を再計算（vh変動対策）
      onUpdate: (self) => {
        // スクロール進行度（0〜1）に応じてserviceIndexを更新
        const progress = self.progress;
        
        // 3つのサービスに分割（0-0.33 → 0, 0.33-0.66 → 1, 0.66-1 → 2）
        let newIndex;
        if (progress < 0.3) {
          newIndex = 0;
        } else if (progress < 0.56) {
          newIndex = 1;
        } else {
          newIndex = 2;
        }
        
        // serviceIndexを更新（変更があった場合のみ）
        setServiceIndex(prevIndex => {
          if (prevIndex !== newIndex) {
            console.log(`🔄 [GSAP ScrollTrigger Mobile/Tablet] serviceIndex変更: ${prevIndex} → ${newIndex} (progress: ${(progress * 100).toFixed(1)}%)`);
            return newIndex;
          }
          return prevIndex;
        });
      },
      onEnter: () => {
        // Serviceセクションに入った時、現在のserviceIndexを維持
        console.log(`🎯 [GSAP ScrollTrigger Mobile/Tablet] Our Serviceセクションに入りました`);
      },
      markers: false, // デバッグ用マーカー（本番環境ではfalse）
    };

    // ScrollTriggerを作成
    const scrollTrigger = ScrollTrigger.create(scrollTriggerConfig);

    console.log(`✅ [GSAP ScrollTrigger Mobile/Tablet] Our Serviceセクションの設定完了 - ScrollTrigger作成成功`);

    // リサイズ時にScrollTriggerを再計算
    const handleResize = () => {
      console.log(`🔄 [GSAP ScrollTrigger] リサイズ検知 - ScrollTrigger.refresh()実行`);
      ScrollTrigger.refresh();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // 初回表示時にもrefreshを実行（レイアウト確定後）
    setTimeout(() => {
      console.log(`🔄 [GSAP ScrollTrigger] 初回refresh実行`);
      ScrollTrigger.refresh();
    }, 100);

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      scrollTrigger.kill();
      console.log(`🔧 [GSAP ScrollTrigger Mobile/Tablet] クリーンアップ完了`);
    };
  }, [isDesktop, viewportWidth, viewportHeight]); // viewportHeightを追加（vh変動時の再計算を保証）
  // === GSAP ScrollTrigger 終了 ===

  // Drop line animation
  useEffect(() => {
    let animationFrame;
    let startTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000;
      const duration = 2.2;
      const progress = (elapsed % duration) / duration;
      
      setDropLinePosition(progress);
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Background wave animation - stronger visible movement
  useEffect(() => {
    let animationFrame;
    let startTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000;
      
      // Stronger wave motion - 15 second cycle with more variation
      const wave = Math.sin(elapsed * 0.15) * Math.cos(elapsed * 0.1);
      setBackgroundWave(wave);
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);


// グラデーションアニメーション
  useEffect(() => {
    let animationFrameId;
    let startTime = Date.now();
    
    const animateGradients = () => {
      const baseElapsed = (Date.now() - startTime) / 1000;
       const elapsed = baseElapsed * 1.0;  // 2倍速に設定 - この数値を変更すると全体の速度が変わります

     const bottomCoordWave1 = Math.sin(elapsed * 0.75) * 10;  // 減速: よりゆったりとした動き
      const bottomCoordWave2 = Math.cos(elapsed * 0.82) * 30;  // 減速: よりゆったりとした動き
      const bottomCoordX = (bottomCoordWave1 + bottomCoordWave2 * 0.5) * GRADIENT_CONFIG.coordIntensity;
      const bottomCoordY = (bottomCoordWave2 - bottomCoordWave1 * 0.3) * GRADIENT_CONFIG.coordIntensity;
     
     
     
     const bottomOffsetWave1 = Math.sin(elapsed * 0.52) * 0.008;
      const bottomOffsetWave2 = Math.cos(elapsed * 0.43) * 0.012;
      const bottomOffsetWave3 = Math.sin(elapsed * 0.44) * 0.016;
      const bottomOffsetWave4 = Math.cos(elapsed * 0.45) * 0.020;
      const bottomOffsetWave5 = Math.sin(elapsed * 0.36) * 0.035;  // 薄い色の開始 - 動きを強調
      const bottomOffsetWave6 = Math.cos(elapsed * 0.47) * 0.040;  // より大きな動き
      const bottomOffsetWave7 = Math.sin(elapsed * 0.43) * 0.045;  // さらに大きな動き
      const bottomOffsetWave8 = Math.cos(elapsed * 0.35) * 0.058;  // 最も大きな動き（透明部分）
     
      const topCoordWave1 = Math.sin(elapsed * 0.2) * 30;
      const topCoordWave2 = Math.cos(elapsed * 0.25) * 20;
      const topCoordX = (topCoordWave1 + topCoordWave2 * 0.6) * GRADIENT_CONFIG.coordIntensity;
      const topCoordY = (topCoordWave2 - topCoordWave1 * 0.4) * GRADIENT_CONFIG.coordIntensity;
      
      const topOffsetWave1 = Math.sin(elapsed * 0.45) * 0.045;
      const topOffsetWave2 = Math.cos(elapsed * 0.5) * 0.038;
      const topOffsetWave3 = Math.sin(elapsed * 0.55) * 0.032;
      const topOffsetWave4 = Math.cos(elapsed * 0.48) * 0.035;
      const topOffsetWave5 = Math.sin(elapsed * 0.52) * 0.03;
      
      const sankakuCoordWave1 = Math.sin(elapsed * 0.6) * 20;
      const sankakuCoordWave2 = Math.cos(elapsed * 0.75) * 15;
      const sankakuCoordX = (sankakuCoordWave1 + sankakuCoordWave2 * 0.7) * GRADIENT_CONFIG.coordIntensity;
      const sankakuCoordY = (sankakuCoordWave2 - sankakuCoordWave1 * 0.5) * GRADIENT_CONFIG.coordIntensity;
      
      // Topと呼吸を合わせる5段階のoffsetアニメーション
      const sankakuOffsetWave1 = Math.sin(elapsed * 0.55) * 0.04;
      const sankakuOffsetWave2 = Math.cos(elapsed * 0.6) * 0.038;
      const sankakuOffsetWave3 = Math.sin(elapsed * 0.65) * 0.035;
      const sankakuOffsetWave4 = Math.cos(elapsed * 0.58) * 0.032;
      const sankakuOffsetWave5 = Math.sin(elapsed * 0.62) * 0.03;
      
      setGradientAnimations({
        bottom: {
          coordX: GRADIENT_CONFIG.useCoordAnimation ? bottomCoordX : 0,
          coordY: GRADIENT_CONFIG.useCoordAnimation ? bottomCoordY : 0,
          offset1: GRADIENT_CONFIG.useOffsetAnimation ? bottomOffsetWave1 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset2: GRADIENT_CONFIG.useOffsetAnimation ? bottomOffsetWave2 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset3: GRADIENT_CONFIG.useOffsetAnimation ? bottomOffsetWave3 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset4: GRADIENT_CONFIG.useOffsetAnimation ? bottomOffsetWave4 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset5: GRADIENT_CONFIG.useOffsetAnimation ? bottomOffsetWave5 * GRADIENT_CONFIG.offsetIntensity : 0,
          // offset6-8 をstateに設定
         offset6: GRADIENT_CONFIG.useOffsetAnimation ? bottomOffsetWave6 * GRADIENT_CONFIG.offsetIntensity : 0,
       offset7: GRADIENT_CONFIG.useOffsetAnimation ? bottomOffsetWave7 * GRADIENT_CONFIG.offsetIntensity : 0,
     offset8: GRADIENT_CONFIG.useOffsetAnimation ? bottomOffsetWave8 * GRADIENT_CONFIG.offsetIntensity : 0,
       
        },
        top: {
          coordX: GRADIENT_CONFIG.useCoordAnimation ? topCoordX : 0,
          coordY: GRADIENT_CONFIG.useCoordAnimation ? topCoordY : 0,
          offset1: GRADIENT_CONFIG.useOffsetAnimation ? topOffsetWave1 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset2: GRADIENT_CONFIG.useOffsetAnimation ? topOffsetWave2 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset3: GRADIENT_CONFIG.useOffsetAnimation ? topOffsetWave3 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset4: GRADIENT_CONFIG.useOffsetAnimation ? topOffsetWave4 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset5: GRADIENT_CONFIG.useOffsetAnimation ? topOffsetWave5 * GRADIENT_CONFIG.offsetIntensity : 0,
        },
        sankaku: {
          coordX: GRADIENT_CONFIG.useCoordAnimation ? sankakuCoordX : 0,
          coordY: GRADIENT_CONFIG.useCoordAnimation ? sankakuCoordY : 0,
          offset1: GRADIENT_CONFIG.useOffsetAnimation ? sankakuOffsetWave1 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset2: GRADIENT_CONFIG.useOffsetAnimation ? sankakuOffsetWave2 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset3: GRADIENT_CONFIG.useOffsetAnimation ? sankakuOffsetWave3 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset4: GRADIENT_CONFIG.useOffsetAnimation ? sankakuOffsetWave4 * GRADIENT_CONFIG.offsetIntensity : 0,
          offset5: GRADIENT_CONFIG.useOffsetAnimation ? sankakuOffsetWave5 * GRADIENT_CONFIG.offsetIntensity : 0,
        }
      });
      
      animationFrameId = requestAnimationFrame(animateGradients);
    };
    
    animateGradients();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);


  // 背景SVGのスタイル（アニメーション対応）
  const backgroundStyle = {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden'
  };

  const scrollToSection = (ref) => {
    if (!ref.current) return;
    
    // セクションのインデックスを判定
    let sectionIndex = -1;
    if (ref === heroRef) sectionIndex = 0;
    if (ref === aboutRef) sectionIndex = 1;
    if (ref === serviceRef) sectionIndex = 2;
    if (ref === companyRef) sectionIndex = 3;
    
    // デスクトップの場合
    if (isDesktop && sectionIndex >= 0) {
      // currentSectionを更新
      setCurrentSection(sectionIndex);
      
      // Heroセクション（トップ）に戻る場合、serviceIndexを1/3にリセット
      if (sectionIndex === 0) {
        setServiceIndex(0);
        console.log('🔄 [scrollToSection] トップページに戻る → serviceIndexを1/3にリセット');
      }
      // Serviceセクションに移動する場合、1/3から開始
      else if (sectionIndex === 2) {
        setServiceIndex(0);
        console.log('🔄 [scrollToSection] Our Serviceセクションへ → serviceIndexを1/3に設定');
      }
    }
    
    // モバイル/タブレットの場合、GSAPのscrollToを使用（ScrollTriggerと整合性を持たせる）
    if (!isDesktop) {
      const navHeight = 64; // ナビゲーションバーの高さ（px）
      
      if (ref === serviceRef) {
        // Serviceセクションへの移動：要素への直接スクロール
        gsap.to(window, {
          duration: 1.2,
          scrollTo: {
            y: ref.current,
            offsetY: navHeight - 40
          },
          ease: "power3.inOut"
        });
        return; // 早期リターン
      } else if (ref === companyRef) {
        // Companyセクションへの移動：要素への直接スクロール + オフセット調整
        gsap.to(window, {
          duration: 1.2,
          scrollTo: {
            y: ref.current,
            offsetY: navHeight - 180 // ナビゲーションバーの高さから20px引いて調整
          },
          ease: "power3.inOut"
        });
        return; // 早期リターン
      }
    }
    
    // デスクトップの場合、通常のスクロールアニメーション
    const targetPosition = ref.current.offsetTop;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1200;
    let startTime = null;
    
    const easeInOutCubic = (t) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    // スクロール中フラグを設定（ホイールイベント処理との競合を防ぐ）
    isScrolling.current = true;
    
    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        // アニメーション完了後、isScrollingフラグをリセット
        isScrolling.current = false;
        console.log('✅ [scrollToSection] スクロールアニメーション完了');
      }
    };
    
    requestAnimationFrame(animation);
  };


 // 【新実装】Top背景：別の角度とカラーパレットで動的アニメーション
  const AnimatedBackgroundTop = ({ gradientData }) => {
    // グラデーションの方向を計算
    const baseAngle = 160; // Top用の基準角度
    const angleVariation = (gradientData.coordX + gradientData.coordY) * 0.08; // より敏感な角度変化
    const currentAngle = baseAngle + angleVariation;
    
    // カラーストップの位置を動的に計算
    const stop1 = Math.max(0, Math.min(100, (0.03 + gradientData.offset1) * 100));
    const stop2 = Math.max(0, Math.min(100, (0.11 + gradientData.offset2) * 100));
    const stop3 = Math.max(0, Math.min(100, (0.21 + gradientData.offset3) * 100));
    const stop4 = Math.max(0, Math.min(100, (0.30 + gradientData.offset4) * 100));
    const stop5 = Math.max(0, Math.min(100, (0.47 + gradientData.offset5) * 100));
    
    // CSSグラデーション文字列を構築（Topは異なるカラーパレット）
    const gradientStyle = `linear-gradient(${currentAngle}deg, 
      #666 ${stop1}%, 
      #666 ${stop2}%, 
      rgba(140, 140, 140, 0.82) ${stop3}%, 
      rgba(225, 225, 225, 0.43) ${stop4}%, 
      rgba(255, 255, 255, 0.3) ${stop5}%)`;
    
    return (
     <div 
        style={{ 
          position: 'absolute',
          top: '-5%', // 画面外に拡張してブラーを逃がす
          left: '-5%', // 画面外に拡張してブラーを逃がす
          width: '150%', // 画面より大きくしてブラーの余白を確保
          height: `${viewportHeight * 1.5}px`, // 高さも拡張（アドレスバー対応）
          background: gradientStyle, 
          transition: 'background 0.1s ease-out',
          pointerEvents: 'none'
        }}
      />
    );
  };

  // 【新実装】Bottom背景：Companyセクション固定、濃い色の範囲を拡大
  const AnimatedBackgroundBottom = ({ gradientData }) => {
    // グラデーションの方向を計算
    const baseAngle = 15; // Bottom用の基準角度
    const angleVariation = (gradientData.coordX + gradientData.coordY) * 0.08;
    const currentAngle = baseAngle + angleVariation;
    
    // カラーストップの位置を動的に計算（濃い色の範囲を約2倍に拡大）
    const stop1 = Math.max(0, Math.min(100, (0.30 + gradientData.offset1) * 100)); // 0.15 → 0.30
    const stop2 = Math.max(0, Math.min(100, (0.35 + gradientData.offset2) * 100)); // 0.21 → 0.35
    const stop3 = Math.max(0, Math.min(100, (0.45 + gradientData.offset3) * 100)); // 0.33 → 0.45
    const stop4 = Math.max(0, Math.min(100, (0.60 + gradientData.offset4) * 100)); // 0.49 → 0.60
    const stop5 = Math.max(0, Math.min(100, (0.70 + gradientData.offset5) * 100)); // 0.60 → 0.70
    const stop6 = Math.max(0, Math.min(100, (0.80 + gradientData.offset6) * 100)); // 0.70 → 0.80
    const stop7 = Math.max(0, Math.min(100, (0.92 + gradientData.offset7) * 100)); // 0.90 → 0.92
    const stop8 = Math.max(0, Math.min(100, (0.99 + gradientData.offset8) * 100)); // 0.99維持
    
    // CSSグラデーション文字列を構築（Bottomのカラーパレット）
    const gradientStyle = `linear-gradient(${currentAngle}deg, 
      #42433b ${stop1}%,
      rgba(102, 102, 102, 0.8) ${stop2}%,
      rgba(133, 133, 133, 0.6) ${stop3}%,
      rgba(221, 221, 221, 0.4) ${stop4}%,
      rgba(255, 255, 255, 0.4) ${stop5}%,
      rgba(255, 255, 255, 0.35) ${stop6}%,
      rgba(255, 255, 255, 0.27) ${stop7}%,
      rgba(255, 255, 255, 0.0) ${stop8}%
    )`;
    
    return (
      <div 
        style={{ 
          position: 'absolute',
          top: '-20%', // 画面外に拡張してブラーを逃がす
          left: '-80%', // 画面外に拡張してブラーを逃がす
          width: '180%', // 画面より大きくしてブラーの余白を確保
         height: `120%`, // 高さも拡張（アドレスバー対応）
          background: gradientStyle,
          transition: 'background 0.1s ease-out',
          pointerEvents: 'none'
        }}
      />
    );
  };

// 三角形SVGコンポーネント(グラデーションとアニメーション削除 - 単色)
  // レスポンシブ対応: デスクトップ、タブレット、スマフォでサイズを変更
  const AnimatedBackgroundSankaku = () => {
    // デバイスサイズに応じて三角形のサイズと位置を変更
    // 構図: Hero（少し見切れ）→ About（下部見える）→ Service（メイン表示）
    let triangleWidth = '120vw'; // デフォルト（デスクトップ）
    let topPosition = viewportHeight * 1.1; // Serviceセクション中心（1.5画面分の位置）- ピクセル単位
    let leftPosition = '45%'; // 左右中央
    
    if (viewportWidth < 768) {
      // スマフォ: 大きく、Serviceセクションでメイン表示
      triangleWidth = '350vw';
      topPosition = viewportHeight * 1.1; // 1.5画面分の位置
      leftPosition = '45%';
    } else if (viewportWidth >= 768 && viewportWidth < 1024) {
      // タブレット: 中間サイズ
      triangleWidth = '330vw';
      topPosition = viewportHeight * 1.1; // 1.5画面分の位置
      leftPosition = '45%';
    }
    
    return (
      // バンディングノイズ完全削除: PNG画像を使用
      // SVGではなく高品質なPNG画像を使用し、CSSでブラーを適用することで
      // バンディングノイズを完全に回避
      <div
        style={{ 
          position: 'absolute',
          left: leftPosition,
          top: `${topPosition}px`, // ピクセル単位で指定（viewportHeightベース）
          width: triangleWidth,
          height: 'auto',
          transform: 'translate(-50%, -50%)',
          maxWidth: 'none',
          filter: 'blur(30px)', // PNG画像にブラーを適用
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      >
        <img
          src="/bg_sankaku_nofilter.png"
          alt=""
          style={{ 
            width: '100%',
            height: 'auto',
            display: 'block',
            pointerEvents: 'none'
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      {/*  背景レイヤー - スクロールパララックス対応（モバイルアドレスバー問題解決） */}
      <div 
        className="background-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${viewportHeight * 4}px`, // 4画面分の高さ（全セクションをカバー）- viewportHeightベース
          overflow: 'visible',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      >
        {/* Bottom背景はCompanyセクションに移動しました */}
        <AnimatedBackgroundTop gradientData={gradientAnimations.top} />
        <AnimatedBackgroundSankaku gradientData={gradientAnimations.sankaku} />
      </div>

      {/* Navigation タブレット縦: ml-0 タブレット横: -ml-[150px] */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-10 backdrop-blur-sm shadow-sm">
       <div className="max-w-8xl mx-auto px-4 md:px-10 py-4 flex justify-between items-center">
          <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81.7 16.2" className="h-8 md:portrait:ml-0 md:landscape:-ml-[0px] lg:-ml-[250px]">
            <defs>
              <style>{`
                .cls-1 {
                  fill: #00af33;
                }
              `}</style>
            </defs>
            <g id="Layer_1-2" data-name="Layer 1">
              <g>
                <path className="cls-1" d="M14.82,11.55c0,2.76-2.56,4.4-6.74,4.4H0v-.58c1.49-.19,1.87-.37,1.87-1.55V2.39c0-1.19-.39-1.36-1.87-1.55V.26h8.14c3.6,0,5.64,1.25,5.64,3.56s-2.09,3.38-3.9,3.75c2.74.24,4.93,1.47,4.93,3.99ZM6.59,1.27h-1.29v6.08h1.51c2.2,0,3.4-1.31,3.4-3.19s-1.14-2.89-3.62-2.89ZM11.1,11.7c0-1.98-1.23-3.32-3.86-3.32h-1.94v6.33c.43.13,1.12.22,1.77.22,2.61,0,4.03-1.12,4.03-3.23Z"/>
                <path className="cls-1" d="M29.94,11.25l-.32,4.7h-13.29v-.58c1.49-.19,1.87-.37,1.87-1.55V2.39c0-1.19-.39-1.36-1.87-1.55V.26h13.12v4.14h-.65l-.6-1.19c-.88-1.75-2.2-1.94-3.73-1.94h-2.84v6.08h2c1.55,0,2.35-.19,2.82-1.38l.19-.54h.65v4.87h-.65l-.19-.54c-.47-1.19-1.27-1.38-2.82-1.38h-2v6.29c.62.19,1.27.26,2.37.26,2.31,0,3.66-.24,4.46-1.94l.84-1.75h.65Z"/>
                <path className="cls-1" d="M31.66,15.04v-3.77h.69c.58,2.61,2.52,4.01,4.63,4.01,1.85,0,3.21-1.03,3.21-2.67,0-1.29-.82-2.13-2.95-2.93l-1.14-.43c-2.37-.9-4.24-1.98-4.24-4.61,0-2.84,2.2-4.63,5.65-4.63,2.41,0,4.12.8,4.74,1.12v3.38h-.67c-.67-2.11-2.09-3.58-4.12-3.58-1.68,0-2.69,1.08-2.69,2.5,0,1.23.75,2.05,2.8,2.84l1.14.43c3.1,1.19,4.4,2.43,4.4,4.74,0,2.93-2.26,4.76-6.05,4.76-2.54,0-4.78-.8-5.39-1.16Z"/>
                <path className="cls-1" d="M58.36.26v4.55h-.65l-.67-1.59c-.73-1.77-2.15-1.94-3.53-1.94h-.54v12.54c0,1.18.41,1.36,1.87,1.55v.58h-7.17v-.58c1.49-.19,1.9-.37,1.9-1.55V1.27h-.54c-1.38,0-2.8.17-3.53,1.94l-.67,1.59h-.65V.26h14.18Z"/>
                <path className="cls-1" d="M59.41,15.36c1.49-.19,1.87-.37,1.87-1.55V2.39c0-1.19-.39-1.36-1.87-1.55V.26h7.17v.58c-1.46.19-1.87.37-1.87,1.55v11.42c0,1.18.41,1.36,1.87,1.55v.58h-7.17v-.58Z"/>
                <path className="cls-1" d="M81.7,11.25l-.32,4.7h-13.29v-.58c1.49-.19,1.87-.37,1.87-1.55V2.39c0-1.19-.39-1.36-1.87-1.55V.26h13.12v4.14h-.65l-.6-1.19c-.88-1.75-2.2-1.94-3.73-1.94h-2.84v6.08h2c1.55,0,2.35-.19,2.82-1.38l.19-.54h.65v4.87h-.65l-.19-.54c-.47-1.19-1.27-1.38-2.82-1.38h-2v6.29c.62.19,1.27.26,2.37.26,2.31,0,3.66-.24,4.46-1.94l.84-1.75h.65Z"/>
              </g>
            </g>
          </svg>
         {/* デスクトップメニュー */}
          <div className="hidden md:flex gap-6 md:landscape:gap-10 lg:gap-14" style={{ marginRight: -0 }}>
           <button onClick={() => scrollToSection(serviceRef)} className="text-xl md:landscape:text-2xl lg:text-3xl hover:text-green-600 transition-colors">SERVICE</button>
           <button onClick={() => scrollToSection(companyRef)} className="text-xl md:landscape:text-2xl lg:text-3xl hover:text-green-600 transition-colors">COMPANY</button>
           <button onClick={() => setShowContact(true)} className="text-xl md:landscape:text-2xl lg:text-3xl hover:text-green-600 transition-colors">CONTACT</button>
          </div>
          
          {/* ハンバーガーメニューボタン（モバイル） */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center relative z-50"
            aria-label="メニュー"
          >
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
        
        {/* モバイルメニュー */}
        <div className={`md:hidden fixed top-0 right-0 h-screen w-64 bg-white shadow-2xl transform transition-all duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`} style={{ paddingTop: '80px' }}>
          <div className="flex flex-col gap-6 px-8">
            <button
              onClick={() => { scrollToSection(serviceRef); setIsMenuOpen(false); }}
              className="text-lg hover:text-green-600 transition-all duration-300 transform hover:translate-x-2 text-left py-3 border-b border-gray-200"
            >
              SERVICE
            </button>
            <button
              onClick={() => { scrollToSection(companyRef); setIsMenuOpen(false); }}
              className="text-lg hover:text-green-600 transition-all duration-300 transform hover:translate-x-2 text-left py-3 border-b border-gray-200"
            >
              COMPANY
            </button>
            <button
              onClick={() => { setShowContact(true); setIsMenuOpen(false); }}
              className="text-lg hover:text-green-600 transition-all duration-300 transform hover:translate-x-2 text-left py-3 border-b border-gray-200"
            >
              CONTACT
            </button>
          </div>
        </div>
        
        {/* モバイルメニュー背景オーバーレイ */}
        {isMenuOpen && (
          <div
            onClick={() => setIsMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black transition-opacity duration-500"
            style={{ opacity: 0.5 }}
          />
        )}
      </nav>

      {/* PageTopボタン設定 - Companyセクションでのみ表示 */}
      <button
        onClick={() => scrollToSection(heroRef)}
        className="fixed z-40 flex flex-col items-center justify-center text-white group"
        style={{
          right: isDesktop ? '30px' : '20px',
          bottom: isDesktop ? '20px' : '20px',
          transform: 'none',
          backgroundColor: 'transparent',
          padding: isDesktop ? '10px' : '5px',
          opacity: showCompany ? 0.7 : 0,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: showCompany ? 'auto' : 'none',
        }}
        aria-label="トップページに戻る"
        onMouseEnter={(e) => { if (showCompany) e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { if (showCompany) e.currentTarget.style.opacity = '0.7'; }}
      >
        {/* 細い上向き矢印（三角 + 縦線） */}
        <div className="flex flex-col items-center" style={{ gap: '2px', marginBottom: isDesktop ? '12px' : '6px' }}>
          {/* 矢印の先端（三角） */}
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderBottom: '6px solid white',
          }} />
          {/* 矢印の縦線 */}
          <div style={{
            width: '1px',
            height: isDesktop ? '70px' : '35px',
            backgroundColor: 'white',
          }} />
        </div>
        
        {/* テキスト「Page」- 各文字の角度を個別に調整可能 */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontSize: isDesktop ? '10px' : '9px',
          fontWeight: 400,
          letterSpacing: '0.05em',
          lineHeight: 1,
          gap: '2px',
          marginBottom: isDesktop ? '20px' : '10px'
        }}>
          {/* 各文字の角度を個別に設定（rotate()の数値を変更して調整可能） */}
          {/* 角度の例: 0deg=正常, 90deg=右に90度, 180deg=上下逆, 270deg=左に90度, -90deg=左に90度 */}
          <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>p</span>
          <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>o</span>
          <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>T</span>
          <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>e</span>
          <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>g</span>
          <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>a</span>
          <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>P</span>
        </div>
      </button>

      {/* Hero Section */}
     <section ref={heroRef} className="flex flex-col items-center justify-center md:items-start md:justify-center px-6 relative" style={{ height: viewportHeight }}>
       <div className="text-center md:text-left md:ml-[30px]" style={{ transform: 'translateY(-40px)' }}>
          <h1 className="text-xl md:text-3xl  md:landscape:text-4xl lg:text-6xl font-bold mb-6 hero-main-title" style={{ fontFamily: '"Yu Mincho", "游明朝", YuMincho, "Hiragino Mincho ProN", serif', marginBottom: isDesktop ? '55px' : '14px', fontSize: isDesktop ? '50px' : undefined}}>
            {'人の力が動き出すとき、組織は変わる'.split('').map((char, index) => (
              <span
                key={index}
                className={`inline-block transition-all duration-500 ${showHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ 
                  transitionDelay: `${index * 50}ms`,
                  whiteSpace: char === '、' ? 'pre' : 'normal',
                  animation: showHero ? `charGoldShine 0.5s ease-in-out ${1.5 + index * 0.05}s 1 forwards` : 'none'
                }}
              >
                {char}
              </span>
            ))}
          </h1>
          <p className="text-base md:text-3xl  md:landscape:text-4xl lg:text-6xl font-bold hero-main-title" style={{ fontFamily: '"Yu Mincho", "游明朝", YuMincho, "Hiragino Mincho ProN", serif', fontSize: isDesktop ? '50px' : undefined }}>
            {'～外からだからこそ、見える景色があります～'.split('').map((char, index) => (
              <span key={index} className={`inline-block transition-all duration-500 ${showHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${(index + 17) * 50}ms`, whiteSpace: char === 'ï½ž' ? 'pre' : 'normal' }}>
                {char}
              </span>
            ))}
          </p>
        </div>
        <style>{`
           @keyframes charGoldShine {
            0%, 100% { color: inherit; text-shadow: none; }
            50% { color: #d4af37; text-shadow: 0 0 1px rgba(212, 175, 55, 0.8); }
          }
         
      
      `}</style>

        {/* Scroll Down */}
        <div className="absolute left-8 bottom-0 flex flex-col items-center gap-4">
          <div className="text-sm text-gray-400 tracking-widest" style={{ writingMode: 'vertical-rl' }}>Scroll Down</div>
          <div className="relative w-px h-32 md:h-40 bg-gray-300 overflow-hidden">
            <div className="absolute left-0 w-full bg-gradient-to-b from-red-400 to-red-300" style={{
              bottom: `${100 - dropLinePosition * 100}%`,
              height: `${dropLinePosition < 0.15 ? 1 + dropLinePosition * 260 : dropLinePosition > 0.7 ? 40 - (dropLinePosition - 0.7) * 80 : 40}px`,
              opacity: dropLinePosition < 0.1 ? dropLinePosition / 0.1 : dropLinePosition > 0.9 ? (1 - dropLinePosition) / 0.1 : 1
            }}></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="flex items-center justify-end px-6" style={{ height: viewportHeight }}>
        <div className="max-w-5xl mr-0 md:portrait:mr-6 lg:mr-12">
          <h2 className={`text-2xl md:portrait:text-4xl lg:text-6xl mb-12 text-right transition-all duration-1000 ${showAbout ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ fontFamily: '"Source Han Serif JP", "Noto Serif JP", "æ€æºå®‹é«”", serif', fontWeight: 900 }}>
            寄り添う　伴走する　人の光を見出す
          </h2>
          <div className={`space-y-6 text-xl md:portrait:text-4xl lg:text-4xl tracking-tight leading-relaxed md:portrait:leading-[1.5] text-left translate-x-0 md:translate-x-[140px]  md:portrait:pr-[140px] lg:translate-x-0 transition-all duration-1000 delay-300 ${showAbout ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}style={{ fontFamily: '"Yu Mincho", "游明朝", YuMincho, "Hiragino Mincho ProN", "Hiragino Mincho Pro", serif' }}>
            <p>人の中にある光を見つけ出すことで、</p>
            <p>その輝きは自然とまわりへと広がり、</p>
            <p>やがて組織全体を照らしていく――。</p>
            <p>外からだからこそ気付けること、寄り添えることがあります。</p>
            <p>まだ見たことのない景色へ。</p>
            <p>人の力が動き出すとき、業績も組織も変わり始める。</p>
            <p>私たちは、その一歩を確実に形にします。</p>
          </div>
        </div>
      </section>

      {/* Our Service Section　コンテナサイズ5xl */}
      <section ref={serviceRef} className="relative flex items-center justify-center px-6 mt-0 md:portrait:mt-[400px] md:landscape:mt-[80px]" style={{ height: viewportHeight }}>
        
        {/* AnimatedBackgroundBottom - Our ServiceからCompanyまで広げる */}
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            // レスポンシブ対応: デバイスサイズに応じて背景の高さを調整
            // スマフォ: 250%, タブレット縦: 320%, タブレット横以上: 200%
            height: viewportWidth < 768 ? '250%' : 
        (viewportWidth >= 768 && viewportWidth < 1024 && viewportHeight > viewportWidth) ? '320%' : 
        (viewportWidth >= 1024 && viewportWidth <= 1366) ? '230%' :
        '200%',
            overflow: 'hidden',
            zIndex: 0, // Our Serviceの要素の後ろに配置
            pointerEvents: 'none'
          }}
        >
          <AnimatedBackgroundBottom gradientData={gradientAnimations.bottom} />
        </div>
        
        <div className="max-w-7xl mx-auto w-full" style={{ position: 'relative', zIndex: 1 }}>
          
          {/* Desktop Layout - タブレット横以上で表示、タブレット横のみスケール縮小 */}
          <div className="hidden lg:block lg:scale-[0.7] xl:scale-100 lg:origin-center">
            {/* Title and Progress bar　高さ調整 */}
            <div className="flex items-end mb-12 justify-center md:justify-between" style={{ transform: 'translateY(-90px) translateX(-90px)' }}>
              <h2 className={`text-8xl pb-4 transition-all duration-1000 ${showService ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, borderBottom: '2px solid currentColor', display: 'inline-block' }}>
                Our Service
              </h2>
              
              {/* Progress bar位置X240px - aligned with title underline - Desktop */}
              <div className={`w-48 mb-0 transition-all duration-1000 delay-700 ${showService ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transform: 'translateX(240px)' }}>
                <div className="w-full h-0.5 bg-gray-300 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-green-600 transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${((serviceIndex + 1) / services.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            {/*ロゴサイズ配置変更left:XXpx*/}
            <div className={`relative h-[350px] transition-all duration-1000 delay-300 ${showService ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Fixed Outer Circle - no animation - Desktop */}
              <div className="absolute top-1/2 -translate-y-1/2 flex-shrink-0" style={{ zIndex: 5, left: '-55px' }}>
                <div className="relative" style={{ width: '410px', height: '410px' }}>
                  {/* Outer Circle (Base) - Fixed */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{ width: '410px', height: '410px', backgroundColor: '#434345' }}
                  />
                  
                  {/* Inner Symbol Container - with animation */}
                  <div className="absolute inset-0 overflow-hidden rounded-full flex items-center justify-center">
                    {services.map((service, index) => (
                      <div
                        key={index}
                        className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out"
                        style={{
                          transform: `translateY(${(index - serviceIndex) * 100}%)`,
                          opacity: serviceIndex === index ? 1 : 0
                        }}
                      >
                        {/* SVGロゴを表示 */}
                        {index === 0 && (
                        // logo_02.svg - 組織づくりコンサルティング
                        <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 108.72 71.5" style={{ width: '300px', height: '300px' }}>
                          <defs>
                            <linearGradient id="grad237" x1="10.61" y1="21.77" x2="32.03" y2="21.77" gradientUnits="userSpaceOnUse">
                              <stop offset="0" stopColor="#eed1c9"/>
                              <stop offset=".6" stopColor="#e7cbc3"/>
                              <stop offset=".71" stopColor="#eedad4"/>
                              <stop offset="1" stopColor="#fff"/>
                            </linearGradient>
                          </defs>
                          <g>
                            <path fill="url(#grad237)" d="M19.52,8.36c5.45-.58,10.75,1.45,11.83,7.26.25,1.36.91,6.89.6,7.95s-1.36,1.53-1.59,1.99c-4.06,7.98-9.06,15.11-16.11,3.98-.41-.65-3.52-6.38-3.58-6.76-.32-2.18.73-2.84.8-3.38.67-5.7.51-10.24,8.05-11.04Z"/>
                            <path fill="#eed1c9" d="M14.35,37.39l4.97,11.93c.45-1.33.06-5.69.5-6.66.2-.45,2.76-.39,2.98-.2.26.22.49,6.02.7,6.86l4.77-11.93,12.83,5.87c-3.02,1.69-11.03,3.92-12.73,6.76-1.41,2.36-.79,5.42-1.09,8.05H.43c-.15-2.97-1.05-11.77.3-14.02,1.27-2.13,11.2-4.96,13.62-6.66Z"/>
                            <path fill="#e7cbc3" d="M85.54,8.36c9.7-.95,10.9,3.48,11.83,11.24,0,.06.74.68.8.99.48,2.51-5.23,12.33-7.66,13.62-3.03,1.61-6.03.76-8.25-1.69-.98-1.08-5.71-9.51-5.77-10.54-.08-1.59.77-2.13.8-2.39.67-5.83.72-10.5,8.25-11.24Z"/>
                            <path fill="#eed1c9" d="M80.37,37.39l4.77,11.93c.59-.89.4-6.47.89-6.86.22-.17,2.63-.16,2.78,0,.32.35.25,5.76.7,6.66l4.77-11.73,12.73,5.57c.59.57,1.33,1.23,1.49,2.09.68,3.51-.51,9.18,0,12.93l-26.94.1c-.63-.28-.14-5.12-.3-6.06-.78-4.69-9.87-6.68-13.52-8.75l12.63-5.87Z"/>
                            <path fill="#eed1c9" d="M52,0c4.95-.64,10.85,1.6,14.02,5.47,6.52,7.96,2.53,22.23,8.95,30.82l-12.23,1.09c-.69.31.34,4.76.1,5.67.28.76,11.3,4.17,13.02,5.27,7.06,4.48,4.4,15.96,5.57,23.07l-54.58-.1c1.23-7.66-1.69-18.25,5.87-23.17,1.65-.98,12.34-4.28,12.63-5.07.11-.29.53-5.5.3-5.67l-12.43-1.09c6.4-7.21,2.58-27.21,10.04-32.31,1.36-.93,2.83-.81,3.58-1.19,1.84-.96,2.32-2.41,5.17-2.78Z"/>
                            <path fill="#fff" d="M50.61,12.24c4.15,4.77,9.89,6.86,16.01,7.85-.09,5.6-2.66,13.5-7.46,16.8-10.18,7.01-18.2-8.53-17.6-17,4.2-.92,7.6-3.52,9.05-7.66Z"/>
                          </g>
                        </svg>
                      )}
                      {index === 1 && (
                        // logo_03.svg - マネージャ育成支援
                        <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 116.53 107.28" style={{ width: '300', height: '300' }}>
                          <defs>
                            <radialGradient id="grad7" cx="88.42" cy="72.16" r="31.81" gradientUnits="userSpaceOnUse">
                              <stop offset="0" stopColor="#eed1c9"/>
                              <stop offset=".6" stopColor="#e7cbc3"/>
                              <stop offset=".71" stopColor="#eedad4"/>
                              <stop offset="1" stopColor="#fff"/>
                            </radialGradient>
                          </defs>
                          <g>
                            <path fill="url(#grad7)" d="M113.52,37.07c3.8-.33,3.06,3.88,2.73,6.43-.92,7.02-6.75,31.19-10.47,36.41-7.82,10.98-26.64,13.48-31.29,27.37h-14.17l1.2-8.18c4.73-22.66,10.82-18.78,27.15-29.98,3-2.06,10-9.19,13.08-8.72,2.5.38,2.27,2.92,1.42,4.69-1.5,3.13-10.94,10.59-13.96,14.17-1.13,1.34-2.16,2.79-3.27,4.14.17.16.26.37.55.33.36-.05,3.98-4.82,4.69-5.56,2.7-2.83,13-10.96,13.52-13.96.27-1.57-.51-2.77-.44-3.92.07-1.06,5.48-18.91,6.11-20.28.59-1.28,1.64-2.81,3.16-2.94Z"/>
                            <path fill="#eed1c9" d="M2.09,37.07c.7-.09,2.05.26,2.62.65,1.84,1.27,4.54,13.17,5.34,16.03.32,1.15,2.39,6.18,2.4,6.76.02.78-.86,1.62-.65,3.27.4,3.25,11.32,12,14.17,15.05.63.67,3.72,4.85,4.03,4.91.28.05.58-.25.55-.55-1.01-1.11-1.88-2.34-2.83-3.49-2.52-3.02-14.44-13.44-14.83-15.92s.97-3.72,3.38-3.38,7.32,5.76,9.59,7.41c6.87,5.01,20.09,9.66,24.31,16.46,3.86,6.22,4.95,15.86,6.21,23h-14.17c-5.67-15.48-27.3-16.61-33.69-31.51C6.68,71.47-.46,42.97.02,39.36c.14-1.06.94-2.15,2.07-2.29Z"/>
                            <path fill="#eed1c9" d="M28.26,32.93c15.39-1.26,24.96,6.76,27.91,21.59l.87-10.9.65,12.65c2.45-16.8,15.13-26.69,32.16-22.57-1.13,14.14-12.5,27.6-27.69,23.11,4.39-7.63,11.09-13.68,19.08-17.33-10.01,2.25-21.58,10.5-23.22,21.26-.48,3.15.56,14.65,0,15.92-.23.53-1.19.28-1.64.33-.76-.34.28-13.7.11-15.59-.98-11.12-14.01-19.9-23.99-22.02,7.96,3.55,15.97,9.79,19.52,17.77-15.45,3.58-26.34-9.03-27.58-23.44.1-.28,3.34-.72,3.82-.76Z"/>
                            <path fill="#e7cbc3" d="M57.04,0c10.87,10.16,15.73,25.07,5.78,37.83-.47.6-4.82,5.37-5.23,4.58,1.44-9.59,1.55-19.49-.44-29-.53-.03-.8,1.81-.87,2.18-1.71,8.34-.86,18.42.22,26.82-.35.68-3.82-2.91-4.14-3.27-11.26-12.55-6.79-28.69,4.69-39.14Z"/>
                          </g>
                        </svg>
                      )}
                      {index === 2 && (
                        // logo_04.svg - 経営者の思いと戦略をつなぐ伴走
                        <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 131.89 120.96" style={{ width: '300', height: '300' }}>
                          <defs>
                            <radialGradient id="grad7-logo4" cx="66.1" cy="33.41" r="7.44" gradientUnits="userSpaceOnUse">
                              <stop offset="0" stopColor="#eed1c9"/>
                              <stop offset=".6" stopColor="#e7cbc3"/>
                              <stop offset=".71" stopColor="#eedad4"/>
                              <stop offset="1" stopColor="#fff"/>
                            </radialGradient>
                          </defs>
                          <g>
                            <path fill="url(#grad7-logo4)" d="M64.16,25.76c.53-.06,5.57.03,5.67.3.07,5.01.25,11,3.48,15.02l-14.42-.3c3.19-3.72,3.23-9.97,3.38-14.72.62-.02,1.29-.23,1.89-.3Z"/>
                            <path fill="#eed1c9" d="M61.17,11.04c.83-.16,9.19-.17,9.95,0,3.29.73-.05,3.68-.7,5.27-.49,1.19-.65,2.62-.9,3.88l-7.06-.1c1.02-2.94-5.59-8.21-1.29-9.05Z"/>
                            <path fill="#e7cbc3" d="M57.99,43.67c.72-.37,15.4-.38,16.11,0,.24.13,1.63,4.18,3.08,4.48l-22.18.1c.45-1.09,1.54-1.64,2.29-2.69.28-.39.48-1.78.7-1.89Z"/>
                            <path fill="#eed1c9" d="M54.81,50.83h22.48c.28.12.61,1.88.5,2.09-.55,1.02-20.45-.05-23.18.1-.59-.28-.13-2.03.2-2.19Z"/>
                            <path fill="#e7cbc3" d="M19.79,49.24l15.22,8.45-19.3,32.43.5.5c.6.13,3.7-5.14,4.28-6.07,5.16-8.3,9.79-17.03,14.82-25.36l1.09.9-19.2,32.33L0,82.36l19.79-33.12Z"/>
                            <path fill="#eed1c9" d="M61.37,60.77c.91-.09,2.31-.1,3.18.2-4.19,1.93-10.15,2.96-12.83,7.06-.61.93-5.32,12.04-5.37,12.73-.25,3.25,4.27,4.05,6.66,3.48,3.78-.89,5.84-6.06,8.55-7.16.89-.36,10.21-2.53,10.74-2.39,5.68,5.05,11.61,9.87,17.11,15.12,1.56,1.49,7.56,6.81,7.86,8.45.75,4.16-3.24,6.94-6.86,4.67-1.66-1.04-9-9.36-9.75-9.55-.22-.06-.55.04-.8,0-.44.33-.64.75-.5,1.29.18.71,8.59,7.79,9.75,9.55,2.65,4.02-.85,8.28-5.07,6.66-2.41-.93-9.69-10.22-10.94-10.54-.22-.05-.55.04-.8,0-.44.33-.64.75-.5,1.29.27,1.06,8.35,7.45,8.95,9.15,1.59,4.51-3.1,7.27-7.06,4.48-1.27-.9-6.8-7.22-7.36-7.36-.4-.1-.65.11-.99.2-.37.25-.39.95-.3,1.29.15.56,5.05,4.35,5.77,5.37,3.79,5.41-4.3,8.66-7.56,3.78,3.88-3.17,3.45-9.02-1.49-10.64-.5-.17-2.48-.12-2.59-.2-.12-.08-.21-2.22-.5-2.88-.83-1.93-4.32-3.98-6.47-3.28,1.98-4.71-2.57-9.4-7.36-7.96.17-4.1-3.05-7.16-7.16-6.56-3.12.45-4.94,4.75-6.96,6.76l-7.66-7.66,14.22-23.97c3.56,1.5,8.46,1.97,12.33,1.59,3.81-.37,8.02-2.63,11.74-2.98Z"/>
                            <path fill="#e7cbc3" d="M71.71,59.98c4.21-.4,12.12,2.84,16.71,3.18,2.22.17,4.53-.03,6.56-.99l14.22,23.77-11.44,9.85c-8.08-8.05-16.44-15.88-25.46-22.88-.6-.09-10.86,2.41-11.74,2.79-2.46,1.06-4.39,5.69-7.36,6.76-2.25.81-5.55.56-4.87-2.49.43-1.95,4.85-11.61,6.27-12.83,1.23-1.06,15.51-7.01,17.11-7.16Z"/>
                            <path fill="#eed1c9" d="M112.1,49.24l19.79,33.12-16.81,9.85-19.4-32.33c.55-.24.86-.88,1.39-.2,5.42,9.02,10.33,18.9,16.11,27.65.29.44,2.24,3.96,2.88,3.08l-19.2-32.72,15.22-8.45Z"/>
                          </g>
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {services.map((service, index) => (
              <div 
                key={index} 
                className="absolute inset-0 flex items-center"
              >{/* ロゴとテキストの間隔 */}
                <div className="flex items-center gap-64 w-full">
                  {/* Empty space for fixed logo */}
                  <div className="flex-shrink-0" style={{ width: '310px', height: '310px' }}></div>
                  {/* カウンター、文章の高さ調整*/}
                  <div className={`flex-1 transition-all duration-1000 delay-500 ${showService ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ marginTop: '90px' }}>
                    {/* Service counter above title - only show for active service */}
                    <div className="mb-4" style={{ height: '2.5rem', position: 'relative' }}>
                      {serviceIndex === index && (
                        <div className="flex items-center" style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '1.300rem', fontWeight: 700 }}>
                          {/* Animated numerator */}
                          <span className="inline-block relative text-green-600" style={{ width: '0.7em', height: '1.2em', overflow: 'hidden' }}>
                            {[0, 1, 2].map((num) => (
                              <span
                                key={num}
                                className="absolute left-0 top-0 transition-all duration-700 ease-in-out flex items-center justify-center"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  transform: `translateY(${(num - serviceIndex) * 100}%)`,
                                  opacity: serviceIndex === num ? 1 : 0
                                }}
                              >
                                {num + 1}
                              </span>
                            ))}
                          </span>
                          {/* Fixed denominator */}
                          <span className="text-green-600">/3</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Service title文字サイズ with animation anti改行whiteSpace: 'nowrap'*/}
                   <div className="relative overflow-visible mb-0" style={{ height: '7.5rem', width: '100%', perspective: '1000px' }}>
                    <h3 
                     className="text-6xl font-bold absolute"
                     style={{
                     transform: `translateY(${(index - serviceIndex) * 40}%) rotateX(${(index - serviceIndex) * 90}deg)`,
                     opacity: serviceIndex === index ? 1 : 0,
                     whiteSpace: 'nowrap',
                     width: 'max-content',
                     transformStyle: 'preserve-3d',
                     transition: 'all 500ms ease-in-out',
                     transformOrigin: 'center center',
                     backfaceVisibility: 'hidden',
                     zIndex: serviceIndex === index ? 20 : 10
                     }}
                   >
                      {service.title}
                    </h3>
                  </div>
                    
                    {/* Service description全体のコンテナサイズstyle={{ height: 'XXrem'  with animation */}
                   <div className="relative overflow-visible" style={{ minHeight: '18rem', height: 'auto', width: '100%', perspective: '1000px' }}>
                    <div 
                     className="absolute"
                     style={{
                     transform: `translateY(${(index - serviceIndex) * 40}%) rotateX(${(index - serviceIndex) * 90}deg)`,
                     opacity: serviceIndex === index ? 1 : 0,
                     width: 'max-content',
                     minWidth: '100%',
                     transformStyle: 'preserve-3d',
                     transition: 'all 500ms ease-in-out',
                     transformOrigin: 'center center',
                     backfaceVisibility: 'hidden',
                     zIndex: serviceIndex === index ? 20 : 10
                     }}
                   >
                        {service.lines.map((line, lineIndex) => (
                          <p key={lineIndex} className="text-4xl leading-relaxed" style={{ whiteSpace: 'nowrap', overflow: 'visible' }}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          
          {/* スマフォとタブレット縦まで表示 全体の位置はGSAP３４７行目で*/}
          <div className="block lg:hidden">
            {/* 1段目: Title and underline */}
           <div className="mb-8 md:portrait:mb-12 text-left md:portrait:text-center" style={{ transform: 'translateY(-50px) translateX(-10px)' }}> 
              <h2 className={`text-7xl md:portrait:text-9xl pb-3 md:portrait:pb-4 transition-all duration-1000 ${showService ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, borderBottom: '2px solid currentColor', display: 'inline-block', whiteSpace: 'nowrap', }}>
                Our Service
              </h2>
            </div>
            
            {/* 2段目: Logo with animation */}
            <div className={`flex justify-center mb-8 md:portrait:mb-12 transition-all duration-1000 delay-300 ${showService ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative w-[240px] h-[240px] md:portrait:w-[340px] md:portrait:h-[340px]">
                {/* Outer Circle (Base) */}
                <div 
                  className="absolute inset-0 rounded-full bg-[#434345]"
                  
                />
                
                {/* Inner Symbol Container - with animation */}
                <div className="absolute inset-0 overflow-hidden rounded-full flex items-center justify-center">
                  {services.map((service, index) => (
                    <div
                      key={`mobile-logo-${index}`}
                      className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out"
                      style={{
                        transform: `translateY(${(index - serviceIndex) * 100}%)`,
                        opacity: serviceIndex === index ? 1 : 0
                      }}
                    >
                      {/* SVGロゴを表示 */}
                      {index === 0 && (
                        // logo_02.svg - 組織づくりコンサルティング
                        <svg id="Layer_2_mobile" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 108.72 71.5" className="w-[160px] h-[160px] md:portrait:w-[240px] md:portrait:h-[240px]">
                          <defs>
                            <linearGradient id="grad237-mobile" x1="10.61" y1="21.77" x2="32.03" y2="21.77" gradientUnits="userSpaceOnUse">
                              <stop offset="0" stopColor="#eed1c9"/>
                              <stop offset=".6" stopColor="#e7cbc3"/>
                              <stop offset=".71" stopColor="#eedad4"/>
                              <stop offset="1" stopColor="#fff"/>
                            </linearGradient>
                          </defs>
                          <g>
                            <path fill="url(#grad237-mobile)" d="M19.52,8.36c5.45-.58,10.75,1.45,11.83,7.26.25,1.36.91,6.89.6,7.95s-1.36,1.53-1.59,1.99c-4.06,7.98-9.06,15.11-16.11,3.98-.41-.65-3.52-6.38-3.58-6.76-.32-2.18.73-2.84.8-3.38.67-5.7.51-10.24,8.05-11.04Z"/>
                            <path fill="#eed1c9" d="M14.35,37.39l4.97,11.93c.45-1.33.06-5.69.5-6.66.2-.45,2.76-.39,2.98-.2.26.22.49,6.02.7,6.86l4.77-11.93,12.83,5.87c-3.02,1.69-11.03,3.92-12.73,6.76-1.41,2.36-.79,5.42-1.09,8.05H.43c-.15-2.97-1.05-11.77.3-14.02,1.27-2.13,11.2-4.96,13.62-6.66Z"/>
                            <path fill="#e7cbc3" d="M85.54,8.36c9.7-.95,10.9,3.48,11.83,11.24,0,.06.74.68.8.99.48,2.51-5.23,12.33-7.66,13.62-3.03,1.61-6.03.76-8.25-1.69-.98-1.08-5.71-9.51-5.77-10.54-.08-1.59.77-2.13.8-2.39.67-5.83.72-10.5,8.25-11.24Z"/>
                            <path fill="#eed1c9" d="M80.37,37.39l4.77,11.93c.59-.89.4-6.47.89-6.86.22-.17,2.63-.16,2.78,0,.32.35.25,5.76.7,6.66l4.77-11.73,12.73,5.57c.59.57,1.33,1.23,1.49,2.09.68,3.51-.51,9.18,0,12.93l-26.94.1c-.63-.28-.14-5.12-.3-6.06-.78-4.69-9.87-6.68-13.52-8.75l12.63-5.87Z"/>
                            <path fill="#eed1c9" d="M52,0c4.95-.64,10.85,1.6,14.02,5.47,6.52,7.96,2.53,22.23,8.95,30.82l-12.23,1.09c-.69.31.34,4.76.1,5.67.28.76,11.3,4.17,13.02,5.27,7.06,4.48,4.4,15.96,5.57,23.07l-54.58-.1c1.23-7.66-1.69-18.25,5.87-23.17,1.65-.98,12.34-4.28,12.63-5.07.11-.29.53-5.5.3-5.67l-12.43-1.09c6.4-7.21,2.58-27.21,10.04-32.31,1.36-.93,2.83-.81,3.58-1.19,1.84-.96,2.32-2.41,5.17-2.78Z"/>
                            <path fill="#fff" d="M50.61,12.24c4.15,4.77,9.89,6.86,16.01,7.85-.09,5.6-2.66,13.5-7.46,16.8-10.18,7.01-18.20-8.53-17.6-17,4.2-.92,7.6-3.52,9.05-7.66Z"/>
                          </g>
                        </svg>
                      )}
                      {index === 1 && (
                        // logo_03.svg - マネージャ育成支援
                        <svg id="Layer_2_mobile_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 116.53 107.28" className="w-[160px] h-[160px] md:portrait:w-[240px] md:portrait:h-[240px]">
                          <defs>
                            <radialGradient id="grad7-mobile" cx="88.42" cy="72.16" r="31.81" gradientUnits="userSpaceOnUse">
                              <stop offset="0" stopColor="#eed1c9"/>
                              <stop offset=".6" stopColor="#e7cbc3"/>
                              <stop offset=".71" stopColor="#eedad4"/>
                              <stop offset="1" stopColor="#fff"/>
                            </radialGradient>
                          </defs>
                          <g>
                            <path fill="url(#grad7-mobile)" d="M113.52,37.07c3.8-.33,3.06,3.88,2.73,6.43-.92,7.02-6.75,31.19-10.47,36.41-7.82,10.98-26.64,13.48-31.29,27.37h-14.17l1.2-8.18c4.73-22.66,10.82-18.78,27.15-29.98,3-2.06,10-9.19,13.08-8.72,2.5.38,2.27,2.92,1.42,4.69-1.5,3.13-10.94,10.59-13.96,14.17-1.13,1.34-2.16,2.79-3.27,4.14.17.16.26.37.55.33.36-.05,3.98-4.82,4.69-5.56,2.7-2.83,13-10.96,13.52-13.96.27-1.57-.51-2.77-.44-3.92.07-1.06,5.48-18.91,6.11-20.28.59-1.28,1.64-2.81,3.16-2.94Z"/>
                            <path fill="#eed1c9" d="M2.09,37.07c.7-.09,2.05.26,2.62.65,1.84,1.27,4.54,13.17,5.34,16.03.32,1.15,2.39,6.18,2.4,6.76.02.78-.86,1.62-.65,3.27.4,3.25,11.32,12,14.17,15.05.63.67,3.72,4.85,4.03,4.91.28.05.58-.25.55-.55-1.01-1.11-1.88-2.34-2.83-3.49-2.52-3.02-14.44-13.44-14.83-15.92s.97-3.72,3.38-3.38,7.32,5.76,9.59,7.41c6.87,5.01,20.09,9.66,24.31,16.46,3.86,6.22,4.95,15.86,6.21,23h-14.17c-5.67-15.48-27.3-16.61-33.69-31.51C6.68,71.47-.46,42.97.02,39.36c.14-1.06.94-2.15,2.07-2.29Z"/>
                            <path fill="#eed1c9" d="M28.26,32.93c15.39-1.26,24.96,6.76,27.91,21.59l.87-10.9.65,12.65c2.45-16.8,15.13-26.69,32.16-22.57-1.13,14.14-12.5,27.6-27.69,23.11,4.39-7.63,11.09-13.68,19.08-17.33-10.01,2.25-21.58,10.5-23.22,21.26-.48,3.15.56,14.65,0,15.92-.23.53-1.19.28-1.64.33-.76-.34.28-13.7.11-15.59-.98-11.12-14.01-19.9-23.99-22.02,7.96,3.55,15.97,9.79,19.52,17.77-15.45,3.58-26.34-9.03-27.58-23.44.1-.28,3.34-.72,3.82-.76Z"/>
                            <path fill="#e7cbc3" d="M57.04,0c10.87,10.16,15.73,25.07,5.78,37.83-.47.6-4.82,5.37-5.23,4.58,1.44-9.59,1.55-19.49-.44-29-.53-.03-.8,1.81-.87,2.18-1.71,8.34-.86,18.42.22,26.82-.35.68-3.82-2.91-4.14-3.27-11.26-12.55-6.79-28.69,4.69-39.14Z"/>
                          </g>
                        </svg>
                      )}
                      {index === 2 && (
                        // logo_04.svg - 経営者の思いと戦略をつなぐ伴走
                        <svg id="Layer_2_mobile_3" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 131.89 120.96" className="w-[160px] h-[160px] md:portrait:w-[240px] md:portrait:h-[240px]">
                          <defs>
                            <radialGradient id="grad7-logo4-mobile" cx="66.1" cy="33.41" r="7.44" gradientUnits="userSpaceOnUse">
                              <stop offset="0" stopColor="#eed1c9"/>
                              <stop offset=".6" stopColor="#e7cbc3"/>
                              <stop offset=".71" stopColor="#eedad4"/>
                              <stop offset="1" stopColor="#fff"/>
                            </radialGradient>
                          </defs>
                          <g>
                            <path fill="url(#grad7-logo4-mobile)" d="M64.16,25.76c.53-.06,5.57.03,5.67.3.07,5.01.25,11,3.48,15.02l-14.42-.3c3.19-3.72,3.23-9.97,3.38-14.72.62-.02,1.29-.23,1.89-.3Z"/>
                            <path fill="#eed1c9" d="M61.17,11.04c.83-.16,9.19-.17,9.95,0,3.29.73-.05,3.68-.7,5.27-.49,1.19-.65,2.62-.9,3.88l-7.06-.1c1.02-2.94-5.59-8.21-1.29-9.05Z"/>
                            <path fill="#e7cbc3" d="M57.99,43.67c.72-.37,15.4-.38,16.11,0,.24.13,1.63,4.18,3.08,4.48l-22.18.1c.45-1.09,1.54-1.64,2.29-2.69.28-.39.48-1.78.7-1.89Z"/>
                            <path fill="#eed1c9" d="M54.81,50.83h22.48c.28.12.61,1.88.5,2.09-.55,1.02-20.45-.05-23.18.1-.59-.28-.13-2.03.2-2.19Z"/>
                            <path fill="#e7cbc3" d="M19.79,49.24l15.22,8.45-19.3,32.43.5.5c.6.13,3.7-5.14,4.28-6.07,5.16-8.3,9.79-17.03,14.82-25.36l1.09.9-19.2,32.33L0,82.36l19.79-33.12Z"/>
                            <path fill="#eed1c9" d="M61.37,60.77c.91-.09,2.31-.1,3.18.2-4.19,1.93-10.15,2.96-12.83,7.06-.61.93-5.32,12.04-5.37,12.73-.25,3.25,4.27,4.05,6.66,3.48,3.78-.89,5.84-6.06,8.55-7.16.89-.36,10.21-2.53,10.74-2.39,5.68,5.05,11.61,9.87,17.11,15.12,1.56,1.49,7.56,6.81,7.86,8.45.75,4.16-3.24,6.94-6.86,4.67-1.66-1.04-9-9.36-9.75-9.55-.22-.06-.55.04-.8,0-.44.33-.64.75-.5,1.29.18.71,8.59,7.79,9.75,9.55,2.65,4.02-.85,8.28-5.07,6.66-2.41-.93-9.69-10.22-10.94-10.54-.22-.05-.55.04-.8,0-.44.33-.64.75-.5,1.29.27,1.06,8.35,7.45,8.95,9.15,1.59,4.51-3.1,7.27-7.06,4.48-1.27-.9-6.8-7.22-7.36-7.36-.4-.1-.65.11-.99.2-.37.25-.39.95-.3,1.29.15.56,5.05,4.35,5.77,5.37,3.79,5.41-4.3,8.66-7.56,3.78,3.88-3.17,3.45-9.02-1.49-10.64-.5-.17-2.48-.12-2.59-.2-.12-.08-.21-2.22-.5-2.88-.83-1.93-4.32-3.98-6.47-3.28,1.98-4.71-2.57-9.4-7.36-7.96.17-4.1-3.05-7.16-7.16-6.56-3.12.45-4.94,4.75-6.96,6.76l-7.66-7.66,14.22-23.97c3.56,1.5,8.46,1.97,12.33,1.59,3.81-.37,8.02-2.63,11.74-2.98Z"/>
                            <path fill="#e7cbc3" d="M71.71,59.98c4.21-.4,12.12,2.84,16.71,3.18,2.22.17,4.53-.03,6.56-.99l14.22,23.77-11.44,9.85c-8.08-8.05-16.44-15.88-25.46-22.88-.6-.09-10.86,2.41-11.74,2.79-2.46,1.06-4.39,5.69-7.36,6.76-2.25.81-5.55.56-4.87-2.49.43-1.95,4.85-11.61,6.27-12.83,1.23-1.06,15.51-7.01,17.11-7.16Z"/>
                            <path fill="#eed1c9" d="M112.1,49.24l19.79,33.12-16.81,9.85-19.4-32.33c.55-.24.86-.88,1.39-.2,5.42,9.02,10.33,18.9,16.11,27.65.29.44,2.24,3.96,2.88,3.08l-19.2-32.72,15.22-8.45Z"/>
                          </g>
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 3段目 & 4段目: Counter and Contentコンテンツエリア全体コンテナ位置 */}
            <div className={`px-4 md:portrait:px-6 relative h-[12rem] md:portrait:h-[18rem] transition-all duration-1000 delay-500 ${showService ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {services.map((service, index) => (
                <div 
                  key={`mobile-content-${index}`}
                  className="absolute inset-0 flex flex-col items-start md:portrait:items-center"
                >
                  {/* 3段目: Counter (small size, top-left of text) - PC版と同じアニメーション構造 */}
                  <div className="mb-2 md:portrait:mb-4 h-[2rem] md:portrait:h-[3rem] relative">
                    {serviceIndex === index && (
                      <div className="flex items-center text-[1.25rem] md:portrait:text-[2rem]" style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 }}>
                        {/* Animated numerator */}
                        <span className="inline-block relative text-green-600" style={{ width: '0.6em', height: '1em', overflow: 'hidden' }}>
                          {[0, 1, 2].map((num) => (
                            <span
                              key={num}
                              className="absolute left-0 top-0 transition-all duration-700 ease-in-out flex items-center justify-center"
                              style={{
                                width: '100%',
                                height: '100%',
                                transform: `translateY(${(num - serviceIndex) * 100}%)`,
                                opacity: serviceIndex === num ? 1 : 0
                              }}
                            >
                              {num + 1}
                            </span>
                          ))}
                        </span>
                        {/* Fixed denominator */}
                        <span className="text-green-600">/3</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 4段目: Title - PC版と同じアニメーション構造 */}
                  <div className="relative overflow-hidden mb-6 md:portrait:mb-8 h-[2rem] md:portrait:h-[3rem] w-full">
                    <h3 
                      className="text-2xl md:portrait:text-4xl font-bold absolute transition-all duration-700 ease-in-out service-title-center"
                      style={{
                        left: window.innerWidth >= 768 && window.innerWidth < 1024 && window.innerHeight > window.innerWidth ? '50%' : '0',
                       transform: `translateY(${(index - serviceIndex) * 100}%) translateX(${window.innerWidth >= 768 && window.innerWidth < 1024 && window.innerHeight > window.innerWidth ? '-50%' : '0'})`,
                        opacity: serviceIndex === index ? 1 : 0
                      }}
                    >
                      {service.title}
                    </h3>
                  </div>
                  
                  {/* 4段目: Description位置配置など - PC版と同じアニメーション構造 */}
                  <div className="relative overflow-hidden h-[8rem] md:portrait:h-[12rem] w-full flex justify-start md:portrait:justify-center">
                    <div 
                      className="space-y-3 md:portrait:space-y-4 absolute transition-all duration-700 ease-in-out"
                       style={{
                        transform: `translateY(${(index - serviceIndex) * 100}%)`,
                        opacity: serviceIndex === index ? 1 : 0
                      }}
                    >
                      {service.lines.map((line, lineIndex) => (
                    <p 
                     key={lineIndex} 
                     className="text-base md:portrait:text-3xl leading-relaxed"
                    >
                    {line}
                    </p>
              ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 5段目: Progress Bar (with padding) */}
            <div className={`px-8 mt-6 mb-0 md:portrait:mb-96 md:landscape:mb-12 transition-all duration-1000 delay-700 ${showService ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transform: showService ? 'translateY(70px)' : 'translateY(80px)' }}>
              <div className="w-full h-0.5 bg-gray-300 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-green-600 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${((serviceIndex + 1) / services.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

           {/* Company Section - 白い背景を削除、下線を削除、白文字 セクション間のパディング調整 */}
       <section ref={companyRef} className="relative flex items-center justify-center px-6 pt-64 md:portrait:pt-96 md:landscape:pt-16 pb-32 lg:pb-40" style={{ minHeight: isDesktop ? `${viewportHeight}px` : 'auto', height: isDesktop ? `${viewportHeight}px` : 'auto' }}>
        
        <div className="max-w-4xl w-full" style={{ position: 'relative', zIndex: 1 }}>
          
          {/*別々にデスクトップ タブレット ヨコ横 位置設定*/}
            <div className="hidden lg:block lg:scale-[0.7] xl:scale-100 lg:origin-center">
             <div className="mb-8 text-left" style={{ 
               transform: viewportWidth >= 1024 && viewportWidth <= 1366 
                ? 'translateY(200px) translateX(-150px)' // タブレット横専用の位置
                : 'translateY(50px) translateX(-190px)' // デスクトップの位置
             }}>
                <h2 className={`text-8xl pb-3 transition-all duration-1000 ${showCompany ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, borderBottom: '2px solid currentColor', display: 'inline-block' }}>
                 Company
                </h2>
            </div>
            
           
           {/* 別々にデスクトップ＆タブレットタテ縦100px,110px、白い背景を削除、下線を削除、白文字 */}
           <div 
              className="space-y-6 transition-all duration-1000 delay-600" 
              style={{ 
                transform: viewportWidth >= 1024 && viewportWidth <= 1366
                  ? `translateX(-140px) translateY(${showCompany ? '300px' : '80px'})` // タブレット横専用の位置
                  : `translateX(-180px) translateY(${showCompany ? '100px' : '70px'})`, // デスクトップの位置
                opacity: showCompany ? 1 : 0,
                overflow: `visible` // 白文字が切れないようにする
              }}
            >
              <div className="flex pb-">
                <div className="w-64 font-bold text-white"  style={{ fontSize: '2.5rem' }}>社名</div>
                <div className="flex-1 text-white" style={{ fontSize: '2.5rem' }}>株式会社ベスティ</div>
              </div>
              <div className="flex pb-4">
                <div className="w-64 font-bold text-white" style={{ fontSize: '2.5rem' }}>代表</div>
                <div className="flex-1 flex items-center text-white" style={{ fontSize: '2.5rem' }}>
                  番場万有美
                  {/* 赤い円、白文字「PROFILE」ボタン */}
                  <button
                    onClick={() => setShowProfile(true)}
                    className="ml-4 px-3 py-1 text-white text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#fc4242' }}
                  >
                    PROFILE
                  </button>
                </div>
              </div> 
              {/*absolute配置 = 親の幅制限を完全に無視 maxWidth: 'none' = 最大幅制限を解除 width: 'max-content' = コンテンツに合わせて幅が決まる whiteSpace: 'nowrap' = 改行を阻止 overflow: 'visible' = はみ出しを表示*/}
              <div className="pb-4 relative" style={{ height: '3rem', overflow: 'visible' }}>
             <div className="absolute left-0 top-0 w-64 font-bold text-white" style={{ fontSize: '2.5rem' }}>
              住所
              </div>
               <div className="absolute text-white" style={{ 
                fontSize: '2.5rem', 
                 whiteSpace: 'nowrap', 
                left: '16rem', 
                top: 0, 
                maxWidth: 'none', 
                width: 'max-content' 
           }}>
                〒104-0061 東京都中央区銀座6-6-1銀座風月堂ビル5F
               </div>
              </div>
              <div className="flex pb-4">
                <div className="w-64 font-bold text-white" style={{ fontSize: '2.5rem' }}>設立</div>
                <div className="flex-1 text-white" style={{ fontSize: '2.5rem' }}>2023年7月6日</div>
              </div>
              <div className="flex">
                <div className="w-64 font-bold text-white" style={{ fontSize: '2.5rem' }}>事業</div>
                <div className="flex-1 text-white" style={{ fontSize: '2.5rem', transform: 'translateX(90px)' }}>
                  <div>組織づくりに関するコンサルティング</div>
                  <div>マネージャー・リーダー層の育成支援</div>
                  <div  style={{ whiteSpace: 'nowrap' }}>経営者のビジョン整理と戦略構築の伴走支援</div>
                  <div>研修・ワークショップの企画・実施</div>
                </div>
              </div>
            </div>
          </div>
          
         {/* Mobile Layout - タブレット縦まで表示 */}
<div className="block lg:hidden">
  <div className="mb-8 md:portrait:mb-12 text-left" style={{ transform: `translateY(${window.innerWidth >= 768 && window.innerWidth < 1024 && window.innerHeight > window.innerWidth ? '-200px' : '-50px'}) translateX(0px)` }}> 
    <h2 className={`text-7xl md:portrait:text-9xl pb-3 md:portrait:pb-4 transition-all duration-1000 ${showCompany ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, borderBottom: '2px solid currentColor', display: 'inline-block' }}>
      Company
    </h2>
  </div>
            
            {/* 白い背景を削除、下線を削除、白文字 */}
            <div className={`text-2xl md:portrait:text-3xl space-y-6 md:portrait:space-y-8 transition-all duration-1000 delay-300 ${showCompany ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ overflow: 'visible', transform: `translateY(${window.innerWidth >= 768 && window.innerWidth < 1024 && window.innerHeight > window.innerWidth ? '-125px' : '0px'}) translateX(0px)`}}
            >
              <div className="flex pb-4 md:portrait:pb-6">
                <div className="w-16 md:portrait:w-24 font-bold text-white">社名</div>
                <div className="flex-1 text-white" >株式会社ベスティ</div>
              </div>
              <div className="flex pb-4 md:portrait:pb-6">
                <div className="w-16 md:portrait:w-24 font-bold text-white">代表</div>
                <div className="flex-1 flex items-center text-white">
                  番場万有美
                  {/* 赤い円、白文字「PROFILE」ボタン */}
                  <button
                    onClick={() => setShowProfile(true)}
                    className="ml-4 px-3 py-1 md:portrait:px-4 md:portrait:py-2 text-white text-xs md:portrait:text-sm rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#fc4242' }}
                  >
                    PROFILE
                  </button>
                </div>
              </div>
              <div className="flex pb-4 md:portrait:pb-6">
                <div className="w-16 md:portrait:w-24 font-bold text-white">住所</div>
                <div className="flex-1 text-white">〒104-0061 東京都中央区銀座6-6-1銀座風月堂ビル5F</div>
              </div>
              <div className="flex pb-4 md:portrait:pb-6">
                <div className="w-16 md:portrait:w-24 font-bold text-white">設立</div>
                <div className="flex-1 text-white">2023年7月6日</div>
              </div>
              <div className="flex">
                <div className="w-16 md:portrait:w-24 font-bold text-white">事業</div>
                <div className="flex-1 text-white">
                  <div>組織づくりに関するコンサルティング</div>
                  <div>マネージャー・リーダー層の育成支援</div>
                  <div>経営者のビジョン整理と戦略構築の伴走支援</div>
                  <div>研修・ワークショップの企画・実施</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>




      {/* プロフィールポップアップ - リッチなアニメーション付き */}
      {showProfile && (
        <>
          {/* 背景オーバーレイ */}
          <div 
            className="fixed inset-0 z-50 bg-black transition-opacity duration-500"
            style={{ 
              opacity: isProfileClosing ? 0 : 0.5,
              animation: isProfileClosing ? 'fadeOut 0.5s ease-out' : 'fadeIn 0.5s ease-out'
            }}
            onClick={handleCloseProfile}
          />
          
          {/* ポップアップコンテンツ */}
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{
              animation: isProfileClosing 
                ? 'popupSlideOut 0.5s cubic-bezier(0.36, 0, 0.66, -0.56) forwards' 
                : 'popupSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div 
              className="relative max-w-2xl w-full mx-4 p-8 md:p-12 rounded-lg pointer-events-auto"
              style={{ 
                backgroundColor: '#42433c'
              }}
            >
              {/* グラデーションアニメーション付き閉じるボタン */}
              <button
                onClick={handleCloseProfile}
                className="absolute top-4 right-4 group"
                style={{ 
                  width: '48px', 
                  height: '48px',
                  padding: 0,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent'
                }}
              >
                {/* グラデーション背景（アニメーション） */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, #00af33, #00d941, #00af33, #008a28)',
                    backgroundSize: '400% 400%',
                    animation: 'gradientFlow 3s ease infinite',
                    boxShadow: '0 0 0 rgba(0, 175, 51, 0)',
                    transition: 'all 0.3s ease'
                  }}
                />
                
                {/* ホバー時の影 */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 175, 51, 0.6)',
                  }}
                />
                
                {/* Closeテキスト */}
                <div
                  className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold tracking-wide transition-transform duration-300 group-hover:scale-110"
                  style={{ zIndex: 1 }}
                >
                  Close
                </div>
              </button>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Profile</h2>
              
              {/* 氏名・役職 */}
              <div className="mb-6 md:mb-8 pl-6 md:pl-8 border-l-2 border-white">
                <p className="text-white text-base md:text-lg mb-3 md:mb-4">番場 万有美(ばんば まゆみ)</p>
                <p className="text-white text-base md:text-lg">株式会社ベスティ　代表取締役</p>
              </div>
              
              {/* 資格・役職 */}
              <div className="mb-6 md:mb-8 pl-6 md:pl-8 border-l-2 border-white">
                <p className="text-white text-base md:text-lg mb-3 md:mb-4">経営心理士</p>
                <p className="text-white text-base md:text-lg mb-3 md:mb-4">一般社団法人 日本ドラゴンフルーツ協会 代表理事</p>
                <p className="text-white text-base md:text-lg">一般社団法人 未来ライフデザイン協会 理事</p>
              </div>
              
              {/* 本文 */}
              <div className="pl-6 md:pl-8 border-l-2 border-white">
                <p className="text-white text-base md:text-lg leading-relaxed mb-3 md:mb-4">
                  美と健康、そして心の豊かさにつながる価値を社会に広げることがライフワーク。
                </p>
                <p className="text-white text-base md:text-lg leading-relaxed mb-3 md:mb-4">
                  一人でも多くの人が、「自分らしく輝ける居場所」を見つけられるよう、
                </p>
                <p className="text-white text-base md:text-lg leading-relaxed">
                  今日も伴走を続けています。
                </p>
              </div>
            </div>
          </div>
          
          {/* アニメーション用CSS */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 0.5; }
            }
            @keyframes fadeOut {
              from { opacity: 0.5; }
              to { opacity: 0; }
            }
            @keyframes popupSlideIn {
              0% {
                opacity: 0;
                transform: scale(0.7) translateY(-20px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            @keyframes popupSlideOut {
              0% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
              100% {
                opacity: 0;
                transform: scale(0.7) translateY(-20px);
              }
            }
            @keyframes gradientFlow {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
          `}</style>
        </>
      )}

      {/* コンタクトポップアップ - リッチなアニメーション付き */}
      {showContact && (
        <>
          {/* 背景オーバーレイ */}
          <div 
            className="fixed inset-0 z-50 bg-black transition-opacity duration-500"
            style={{ 
              opacity: isContactClosing ? 0 : 0.5,
              animation: isContactClosing ? 'fadeOut 0.5s ease-out' : 'fadeIn 0.5s ease-out'
            }}
            onClick={handleCloseContact}
          />
          
          {/* ポップアップコンテンツ */}
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{
              animation: isContactClosing 
                ? 'popupSlideOut 0.5s cubic-bezier(0.36, 0, 0.66, -0.56) forwards' 
                : 'popupSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div 
              className="relative max-w-2xl w-full mx-4 p-8 md:p-12 rounded-lg pointer-events-auto overflow-y-auto"
              style={{ 
                backgroundColor: '#42433c',
                maxHeight: '90vh'
              }}
            >
              {/* グラデーションアニメーション付き閉じるボタン */}
              <button
                onClick={handleCloseContact}
                className="absolute top-4 right-4 group"
                style={{ 
                  width: '48px', 
                  height: '48px',
                  padding: 0,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent'
                }}
              >
                {/* グラデーション背景（アニメーション） */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, #00af33, #00d941, #00af33, #008a28)',
                    backgroundSize: '400% 400%',
                    animation: 'gradientFlow 3s ease infinite',
                    boxShadow: '0 0 0 rgba(0, 175, 51, 0)',
                    transition: 'all 0.3s ease'
                  }}
                />
                
                {/* ホバー時の影 */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 175, 51, 0.6)',
                  }}
                />
                
                {/* Closeテキスト */}
                <div
                  className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold tracking-wide transition-transform duration-300 group-hover:scale-110"
                  style={{ zIndex: 1 }}
                >
                  Close
                </div>
              </button>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Contact</h2>
              
              {/* フォーム */}
              <div className="space-y-4 md:space-y-6">
                {/* 氏名 */}
                <div>
                  <label className="text-white text-base md:text-lg mb-2 block">氏名</label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 rounded bg-white bg-opacity-90 text-gray-800"
                    placeholder="山田 太郎"
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label className="text-white text-base md:text-lg mb-2 block">メールアドレス</label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 rounded bg-white bg-opacity-90 text-gray-800"
                    placeholder="example@email.com"
                  />
                </div>

                {/* 件名 */}
                <div>
                  <label className="text-white text-base md:text-lg mb-2 block">件名</label>
                  <input
                    type="text"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 rounded bg-white bg-opacity-90 text-gray-800"
                    placeholder="お問い合わせ件名"
                  />
                </div>

                {/* 本文 */}
                <div>
                  <label className="text-white text-base md:text-lg mb-2 block">本文</label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    rows="6"
                    className="w-full px-4 py-2 rounded bg-white bg-opacity-90 text-gray-800"
                    placeholder="お問い合わせ内容をご記入ください"
                  />
                </div>

                {/* 送信ボタン */}
                <div>
                  <button
                    onClick={handleSendEmail}
                    className="w-full py-3 rounded text-white font-bold hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#00af33' }}
                  >
                    メールクライアントで送信
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* アニメーション用CSS */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 0.5; }
            }
            @keyframes fadeOut {
              from { opacity: 0.5; }
              to { opacity: 0; }
            }
            @keyframes popupSlideIn {
              0% {
                opacity: 0;
                transform: scale(0.7) translateY(-20px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            @keyframes popupSlideOut {
              0% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
              100% {
                opacity: 0;
                transform: scale(0.7) translateY(-20px);
              }
            }
            @keyframes gradientFlow {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
          `}</style>
        </>
      )}

      {/* Footer - コメントアウト（復元用に保存）
      <footer className="bg-gray-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81.7 16.2" style={{ height: '32px' }}>
              <defs>
                <style>{`
                  .cls-1-footer {
                    fill: #4ade80;
                }
                `}</style>
              </defs>
              <g id="Layer_1-2" data-name="Layer 1">
                <g>
                  <path className="cls-1-footer" d="M14.82,11.55c0,2.76-2.56,4.4-6.74,4.4H0v-.58c1.49-.19,1.87-.37,1.87-1.55V2.39c0-1.19-.39-1.36-1.87-1.55V.26h8.14c3.6,0,5.64,1.25,5.64,3.56s-2.09,3.38-3.9,3.75c2.74.24,4.93,1.47,4.93,3.99ZM6.59,1.27h-1.29v6.08h1.51c2.2,0,3.4-1.31,3.4-3.19s-1.14-2.89-3.62-2.89ZM11.1,11.7c0-1.98-1.23-3.32-3.86-3.32h-1.94v6.33c.43.13,1.12.22,1.77.22,2.61,0,4.03-1.12,4.03-3.23Z"/>
                  <path className="cls-1-footer" d="M29.94,11.25l-.32,4.7h-13.29v-.58c1.49-.19,1.87-.37,1.87-1.55V2.39c0-1.19-.39-1.36-1.87-1.55V.26h13.12v4.14h-.65l-.6-1.19c-.88-1.75-2.2-1.94-3.73-1.94h-2.84v6.08h2c1.55,0,2.35-.19,2.82-1.38l.19-.54h.65v4.87h-.65l-.19-.54c-.47-1.19-1.27-1.38-2.82-1.38h-2v6.29c.62.19,1.27.26,2.37.26,2.31,0,3.66-.24,4.46-1.94l.84-1.75h.65Z"/>
                  <path className="cls-1-footer" d="M31.66,15.04v-3.77h.69c.58,2.61,2.52,4.01,4.63,4.01,1.85,0,3.21-1.03,3.21-2.67,0-1.29-.82-2.13-2.95-2.93l-1.14-.43c-2.37-.9-4.24-1.98-4.24-4.61,0-2.84,2.2-4.63,5.65-4.63,2.41,0,4.12.8,4.74,1.12v3.38h-.67c-.67-2.11-2.09-3.58-4.12-3.58-1.68,0-2.69,1.08-2.69,2.5,0,1.23.75,2.05,2.8,2.84l1.14.43c3.1,1.19,4.4,2.43,4.4,4.74,0,2.93-2.26,4.76-6.05,4.76-2.54,0-4.78-.8-5.39-1.16Z"/>
                  <path className="cls-1-footer" d="M58.36.26v4.55h-.65l-.67-1.59c-.73-1.77-2.15-1.94-3.53-1.94h-.54v12.54c0,1.18.41,1.36,1.87,1.55v.58h-7.17v-.58c1.49-.19,1.9-.37,1.9-1.55V1.27h-.54c-1.38,0-2.8.17-3.53,1.94l-.67,1.59h-.65V.26h14.18Z"/>
                  <path className="cls-1-footer" d="M59.41,15.36c1.49-.19,1.87-.37,1.87-1.55V2.39c0-1.19-.39-1.36-1.87-1.55V.26h7.17v.58c-1.46.19-1.87.37-1.87,1.55v11.42c0,1.18.41,1.36,1.87,1.55v.58h-7.17v-.58Z"/>
                  <path className="cls-1-footer" d="M81.7,11.25l-.32,4.7h-13.29v-.58c1.49-.19,1.87-.37,1.87-1.55V2.39c0-1.19-.39-1.36-1.87-1.55V.26h13.12v4.14h-.65l-.6-1.19c-.88-1.75-2.2-1.94-3.73-1.94h-2.84v6.08h2c1.55,0,2.35-.19,2.82-1.38l.19-.54h.65v4.87h-.65l-.19-.54c-.47-1.19-1.27-1.38-2.82-1.38h-2v6.29c.62.19,1.27.26,2.37.26,2.31,0,3.66-.24,4.46-1.94l.84-1.75h.65Z"/>
                </g>
              </g>
            </svg>
          </div>
          <p className="text-gray-400">© 2023 株式会社ベスティ All Rights Reserved.</p>
        </div>
      </footer>
      */}
    </div>
  );
}