export const ROLE_PERMISSIONS = {
  admin:   ['users.manage', 'contacts.view_all', 'creators.edit', 'campaigns.manage', 'brands.manage', 'recruits.approve'],
  manager: ['contacts.view_all', 'creators.edit', 'campaigns.manage', 'brands.manage', 'recruits.approve'],
  pic:     ['contacts.view_assigned', 'creators.edit'],
  viewer:  [],
  creator: ['creator.self'],
}
