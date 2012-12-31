Passmaster::Application.routes.draw do
  match 'healthz' => 'application#healthz', :via => :get
  match "application.manifest" => APPLICATION_MANIFEST, :via => :get
  root :to => 'application#index', :via => :get

  resources :users, :only => [ :show, :create, :update ] do
    put :verify, :on => :member
  end
end
