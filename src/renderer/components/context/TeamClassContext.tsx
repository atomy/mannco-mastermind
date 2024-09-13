import { createContext, useContext } from 'react';

// Create the context
const TeamClassContext = createContext(null);

// Export the context to use in other components
export const useTeamClassContext = () => useContext(TeamClassContext);

export default TeamClassContext;
