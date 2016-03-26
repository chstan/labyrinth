import _ from 'lodash';

const routerUtils = {
  forAttemptsSection: (chamber, section) => {
    const base = `/learn/chamber/${ chamber.dbId }/${ _.kebabCase(chamber.name) }/`;
    const sectionFrag = `${ section.dbId }/${ _.kebabCase(section.name) }`;
    return base + sectionFrag;
  },
  forEditChamber: (chamber) => `/edit/chamber/${ chamber.dbId }/${ _.kebabCase(chamber.name) }`,
  forAddSection: (chamber) => `/add/${ chamber.dbId }/${ _.kebabCase(chamber.name) }/section`,
  forEditSection: (chamber, section) => {
    const base = `/edit/chamber/${ chamber.dbId }/${ _.kebabCase(chamber.name) }/`;
    const sectionFrag = `${ section.dbId }/${ _.kebabCase(section.name) }`;
    return base + sectionFrag;
  },
};

export default routerUtils;
