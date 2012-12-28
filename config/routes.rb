Passmaster::Application.routes.draw do
  match 'healthz' => 'healthz#index', :via => :get
  root :to => 'healthz#index', :via => :get
end
