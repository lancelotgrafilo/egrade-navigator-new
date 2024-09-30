import { useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import eGradeLogo from '../../assets/images/eGradeLogo-nobg.png';
import eGradeLogo2 from '../../assets/images/eGradeLogo-removebg-preview.png';
import styleHome from './homePage.module.css';
import icon1 from '../../assets/icons/icon1.png';
import icon2 from '../../assets/icons/icon2.png';
import icon3 from '../../assets/icons/icon3.png';
import homeImg from '../../assets/images/computerpeopleFINAL.png';
import pageDividerBottom from '../../assets/images/bottomwave.svg';
import pageDividerTop from '../../assets/images/topwave.svg';
import emailIconWhite from '../../assets/icons/envelope-solid-24.png';

export function HomePage() {
  useEffect(() => {
    if (window.location.hash === '#About') {
      const aboutSection = document.getElementById('About');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const scrollToSection = (e) => {
    e.preventDefault();
    const id = e.currentTarget.hash.substring(1); // Get the id from href
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  

  const aboutH1Ref = useRef();
  const aboutLogoContainerRef = useRef();
  const aboutContentRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styleHome.animate);
        }
      });
    }, { threshold: 0.1 });
  
    const observeElements = [aboutH1Ref, aboutLogoContainerRef, aboutContentRef];
    observeElements.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });
  
    return () => {
      observeElements.forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);
  

  return (
    <>
      <header className={styleHome.header}>
        <nav className={styleHome.navBar}>
          <img src={eGradeLogo} alt="eGrade Navigator" className={styleHome.navLogo} />
          <ul className={styleHome.navUl}>
            <li className={styleHome.navLi}>
              <Link to="#Home" className={styleHome.navButton} onClick={(e) => scrollToSection(e, 'Home')}>Home</Link>
            </li>
            <li className={styleHome.navLi}>
              <Link to="#About" className={styleHome.navButton} onClick={(e) => scrollToSection(e, 'About')}>About</Link>
            </li >
            <li className={styleHome.loginBtn} id={styleHome.navLi}>
              <Link to="/login" className={styleHome.login}>Login</Link>
            </li>
          </ul>
        </nav>
        <Outlet />
      </header>

      <section className={styleHome.homeSection} id="Home">
        <div className={styleHome.homeContainer}>
          <h1 className={styleHome.homeh1}>
            Welcome, <br /> Join us Navigate <br /> our <span className={styleHome.successSpan}>Success</span>!
          </h1>
          <img src={homeImg} alt="" className={styleHome.homeImage} />
        </div>
        <div className={styleHome.pageDividerBottom}>  
          <img src={pageDividerBottom} alt="wave" />
        </div>
      </section>

      <section id="About" className={styleHome.homeAboutSection}>
        <div className={styleHome.aboutContainer}>
          <div className={styleHome.pageDividerTop}>
            <img src={pageDividerTop} alt="" />
          </div>

          <div ref={aboutH1Ref}>
            <h1 className={styleHome.aboutH1}>
              KEY FEATURES:
            </h1>
          </div>

          <div ref={aboutLogoContainerRef} className={styleHome.aboutLogoContainer}>
            <div className={styleHome.logoContainer}>
              <img src={icon1} alt="" className={styleHome.icon} />
              <h2>GRADE<br />ACCESSIBILITY</h2>
            </div>

            <div className={styleHome.logoContainer}>
              <img src={icon2} alt="" className={styleHome.icon} />
              <h2>GRADE <br /> SUBMISSION</h2>
            </div>

            <div className={styleHome.logoContainer}>
              <img src={icon3} alt="" className={styleHome.icon} />
              <h2>ONLINE<br />GRADE REVIEW</h2>
            </div>
          </div>

        </div>
        <div ref={aboutContentRef} className={styleHome.aboutContent}>
          <p>eGrade Navigator is an innovative way to submit, display, and modify grades in such a way as to provide accessibility, convenience, accurate and quality output.</p>
        </div>
      </section>

      <footer>
        <div className={styleHome.footerContainer}>
          <div className={styleHome.footers}>
            <img src={eGradeLogo2} alt="" className={styleHome.eLogo} />
            <p>Copyright &copy; 2024</p>
            <p>All Rights Reserved</p>
          </div>

          <div className={styleHome.footers}>
            <p><img src={emailIconWhite} alt="" className={styleHome.emailIcon} />egradenavigator@gmail.com</p>
            <a href="https://forms.gle/mdyuhmVDkqRh6Jsz8" target="_blank" rel="noopener noreferrer" className={styleHome.evaluation}>Evaluation Form</a>
          </div>

          <div className={styleHome.footers}>
            <p>Developed By:</p>
            <p>Lancelot D. Grafilo</p>
            <p>BSCS 4B</p>
          </div>
        </div>
      </footer>
    </>
  );
}
