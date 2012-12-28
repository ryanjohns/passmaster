Passmaster::Application.routes.draw do
  match 'healthz' => 'healthz#index', :via => :get
  root :to => 'homepage#index', :via => :get
end
