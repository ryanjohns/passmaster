Passmaster::Application.routes.draw do
  match 'healthz' => 'application#healthz', :via => :get
  root :to => 'application#index', :via => :get

  resources :users, :only => [ :show, :create, :update, :destroy ] do
    put :configure, :on => :member
    put :verify, :on => :member
  end
end
