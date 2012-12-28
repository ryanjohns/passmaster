Passmaster::Application.routes.draw do
  match 'healthz' => 'application#healthz', :via => :get
  root :to => 'application#index', :via => :get
end
