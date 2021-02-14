import React from 'react';
import { Switch, Route } from 'react-router-dom';
import CreateProject from './Pages/CreateProject';
import Home from './Pages/Home';
import Project from './Pages/Project';
import ProjectListings from './Pages/ProjectListings';

const Navigation = (): React.ReactElement => {
  return (
    <Switch>
      <Route path="/project/{id}">
        <Project />
      </Route>
      <Route path="/projects">
        <ProjectListings />
      </Route>
      <Route path="/create">
        <CreateProject />
      </Route>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  );
};

export default Navigation;
