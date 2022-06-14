export default class navigationHelper{
    static setActiveNavbarLink(navBarLink){
        if(navBarLink) {
            const navBarLinks = document.querySelectorAll('.uk-navbar-nav > li');
            for (let i = 0; i < navBarLinks.length; i++) {
                navBarLinks[i].classList.remove('uk-active');
            }
            navBarLink.classList.add('uk-active');
        }
    }
}