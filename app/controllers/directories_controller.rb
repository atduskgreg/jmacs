class DirectoriesController < ApplicationController
  before_filter :load_directory
  # GET /directories/1
  # GET /directories/1.xml
  def show
   begin
      @directory.to_json
    rescue Exception => e
      @error = e.message
    end
    respond_to do |format|
      unless @error
        format.json  { render :json => "#{params[:callback]}(#{@directory.to_json})" }
      else
        format.json  { render :json => @error.to_json, :status => 403 }
      end
    end
  end
  
  # # GET /directories
  #   # GET /directories.xml
  #   def index
  #     @directories = Directory.find(:all)
  # 
  #     respond_to do |format|
  #       format.html # index.html.erb
  #       format.xml  { render :xml => @directories }
  #     end
  #   end
  # 
  #   # GET /directories/new
  #   # GET /directories/new.xml
  #   def new
  #     @directory = Directory.new
  # 
  #     respond_to do |format|
  #       format.html # new.html.erb
  #       format.xml  { render :xml => @directory }
  #     end
  #   end
  # 
  #   # GET /directories/1/edit
  #   def edit
  #     @directory = Directory.find(params[:id])
  #   end
  # 
  #   # POST /directories
  #   # POST /directories.xml
  #   def create
  #     @directory = Directory.new(params[:directory])
  # 
  #     respond_to do |format|
  #       if @directory.save
  #         flash[:notice] = 'Directory was successfully created.'
  #         format.html { redirect_to(@directory) }
  #         format.xml  { render :xml => @directory, :status => :created, :location => @directory }
  #       else
  #         format.html { render :action => "new" }
  #         format.xml  { render :xml => @directory.errors, :status => :unprocessable_entity }
  #       end
  #     end
  #   end
  # 
  #   # PUT /directories/1
  #   # PUT /directories/1.xml
  #   def update
  #     @directory = Directory.find(params[:id])
  # 
  #     respond_to do |format|
  #       if @directory.update_attributes(params[:directory])
  #         flash[:notice] = 'Directory was successfully updated.'
  #         format.html { redirect_to(@directory) }
  #         format.xml  { head :ok }
  #       else
  #         format.html { render :action => "edit" }
  #         format.xml  { render :xml => @directory.errors, :status => :unprocessable_entity }
  #       end
  #     end
  #   end
  # 
  #   # DELETE /directories/1
  #   # DELETE /directories/1.xml
  #   def destroy
  #     @directory = Directory.find(params[:id])
  #     @directory.destroy
  # 
  #     respond_to do |format|
  #       format.html { redirect_to(directories_url) }
  #       format.xml  { head :ok }
  #     end
  #   end
  
  def load_directory
    begin
      @directory = Directory.new :path => params[:id].gsub(/\\056/, "."), :pwd => params[:pwd]
    rescue Exception => e
      @error =  e.message
    end
  end
end
